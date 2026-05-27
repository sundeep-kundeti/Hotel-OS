import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-hms-session',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
};

type HMSSession = {
  staffId: string; username: string; name: string;
  role: 'OWNER' | 'MANAGER' | 'HOUSEKEEPING'; loginAt: string;
};

function validateSession(req: Request): HMSSession | null {
  const token = (req.headers.get('x-hms-session') || '').trim();
  if (!token) return null;
  try {
    const decoded = JSON.parse(atob(token)) as HMSSession;
    if (!decoded.username || !decoded.loginAt || !decoded.role) return null;
    if (Date.now() - new Date(decoded.loginAt).getTime() > 12 * 60 * 60 * 1000) return null;
    return decoded;
  } catch { return null; }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ── State machine: who can move a room to which status ────────────────────────
const ALLOWED_TRANSITIONS: Record<string, { to: string[]; roles: string[] }[]> = {
  'Vacant Clean':      [{ to: ['Reserved', 'Pending Check-In'], roles: ['OWNER', 'MANAGER'] }],
  'Reserved':          [{ to: ['Pending Check-In', 'Vacant Clean', 'Blocked'], roles: ['OWNER', 'MANAGER'] }],
  'Pending Check-In':  [{ to: ['Occupied'], roles: ['OWNER', 'MANAGER', 'SYSTEM'] },
                        { to: ['Blocked', 'Vacant Clean'], roles: ['OWNER'] }],
  'Occupied':          [{ to: ['Checkout Pending'], roles: ['OWNER', 'MANAGER', 'SYSTEM'] },
                        { to: ['Blocked'], roles: ['OWNER'] }],
  'Checkout Pending':  [{ to: ['Cleaning'], roles: ['OWNER', 'HOUSEKEEPING'] },
                        { to: ['Blocked'], roles: ['OWNER'] }],
  'Cleaning':          [{ to: ['Vacant Clean'], roles: ['OWNER', 'HOUSEKEEPING'] },
                        { to: ['Vacant Dirty'], roles: ['OWNER', 'HOUSEKEEPING'] }],
  'Vacant Dirty':      [{ to: ['Cleaning'], roles: ['OWNER', 'HOUSEKEEPING'] }],
  'Blocked':           [{ to: ['Vacant Clean'], roles: ['OWNER'] }],
};

function canTransition(from: string, to: string, role: string): boolean {
  const transitions = ALLOWED_TRANSITIONS[from] || [];
  return transitions.some((t) => t.to.includes(to) && t.roles.includes(role));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const session = validateSession(req);
  if (!session) return json({ error: 'Unauthorized' }, 401);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const roomId = pathParts.length > 2 ? pathParts[pathParts.length - 1] : null;
  const isRoot = !roomId || roomId === 'hms-rooms';

  try {
    // ── GET /hms-rooms  → all rooms with status ───────────────────────────────
    if (req.method === 'GET' && isRoot) {
      const floorFilter = url.searchParams.get('floor');
      let query = supabase.from('hms_rooms').select('*').eq('is_active', true).order('room_number');
      if (floorFilter) query = query.eq('floor', parseInt(floorFilter));

      const { data, error } = await query;
      if (error) throw error;
      return json({ rooms: data });
    }

    // ── GET /hms-rooms/<room_id>  → single room ───────────────────────────────
    if (req.method === 'GET' && roomId) {
      const { data, error } = await supabase
        .from('hms_rooms').select('*').eq('id', roomId).single();
      if (error || !data) return json({ error: 'Room not found' }, 404);
      return json({ room: data });
    }

    // ── PATCH /hms-rooms/<room_id>  → status transition ──────────────────────
    if (req.method === 'PATCH' && roomId) {
      const body = await req.json();
      const { new_status, reason, booking_id } = body;

      if (!new_status) return json({ error: 'new_status is required' }, 400);

      const { data: room, error: fetchErr } = await supabase
        .from('hms_rooms').select('*').eq('id', roomId).single();
      if (fetchErr || !room) return json({ error: 'Room not found' }, 404);

      // Enforce state machine
      if (!canTransition(room.status, new_status, session.role)) {
        return json({
          error: `Forbidden transition: ${room.status} → ${new_status} is not allowed for role ${session.role}`,
        }, 403);
      }

      await supabase.from('hms_rooms').update({ status: new_status }).eq('id', roomId);

      // Log the transition
      await supabase.from('hms_room_status_logs').insert({
        room_id: roomId,
        room_number: room.room_number,
        booking_id: booking_id || null,
        old_status: room.status,
        new_status,
        changed_by_role: session.role,
        changed_by_staff_id: session.staffId,
        reason: reason || null,
      });

      // Audit log
      await supabase.from('hms_audit_logs').insert({
        action: 'ROOM_STATUS_CHANGED',
        entity: 'hms_rooms',
        entity_id: roomId,
        old_value: room.status,
        new_value: new_status,
        changed_by_staff_id: session.staffId,
        changed_by_role: session.role,
        reason: reason || null,
        risk_level: new_status === 'Blocked' ? 'HIGH' : 'LOW',
      });

      return json({ success: true, room_number: room.room_number, old_status: room.status, new_status });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
});

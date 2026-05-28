import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-hms-session',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

type HMSSession = { staffId: string; username: string; name: string; role: string; loginAt: string; };

function validateSession(req: Request): HMSSession | null {
  const token = (req.headers.get('x-hms-session') || '').trim();
  if (!token) return null;
  try {
    const decoded = JSON.parse(atob(token)) as HMSSession;
    if (!decoded.username || !decoded.loginAt) return null;
    if (Date.now() - new Date(decoded.loginAt).getTime() > 12 * 60 * 60 * 1000) return null;
    return decoded;
  } catch { return null; }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const session = validateSession(req);
  if (!session) return json({ error: 'Unauthorized' }, 401);

  if (session.role !== 'OWNER') {
    return json({ error: 'Only OWNER can access this endpoint' }, 403);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  // Expected paths:
  // GET /hms-owner/snapshot
  // GET /hms-owner/exceptions
  // GET /hms-owner/audit-logs
  // GET /hms-owner/rewards
  // POST /hms-owner/exceptions/<id>/resolve
  // POST /hms-owner/rewards/<id>/block

  const resource = pathParts[1];
  const id = pathParts.length > 2 ? pathParts[2] : null;
  const action = pathParts.length > 3 ? pathParts[3] : null;

  try {
    // ── GET /hms-owner/snapshot  ───────────────────────────────────────────────
    if (req.method === 'GET' && resource === 'snapshot') {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const todayIso = todayStart.toISOString();

      // Room totals
      const { data: rooms } = await supabase.from('hms_rooms').select('status');
      const totalRooms = rooms?.length || 0;
      const vacantClean = rooms?.filter(r => r.status === 'Vacant Clean').length || 0;
      const occupied = rooms?.filter(r => r.status === 'Occupied').length || 0;
      const checkoutPending = rooms?.filter(r => r.status === 'Checkout Pending').length || 0;
      const cleaning = rooms?.filter(r => r.status === 'Cleaning').length || 0;

      // Bookings today
      const { count: bookingsToday } = await supabase
        .from('hms_bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayIso);

      // Check-ins today
      const { count: checkinsToday } = await supabase
        .from('hms_bookings')
        .select('*', { count: 'exact', head: true })
        .gte('checkin_actual', todayIso);

      // Check-outs today
      const { count: checkoutsToday } = await supabase
        .from('hms_bookings')
        .select('*', { count: 'exact', head: true })
        .gte('guest_checkout_time', todayIso);

      // Manual check-outs today
      const { count: manualCheckoutsToday } = await supabase
        .from('hms_bookings')
        .select('*', { count: 'exact', head: true })
        .gte('manager_checkout_time', todayIso);

      // Rewards activated today
      const { count: rewardsActivated } = await supabase
        .from('hms_rewards')
        .select('*', { count: 'exact', head: true })
        .gte('activated_at', todayIso);

      // Open Exceptions
      const { count: openExceptions } = await supabase
        .from('hms_exceptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Open');

      return json({
        snapshot: {
          totalRooms,
          vacantClean,
          occupied,
          checkoutPending,
          cleaning,
          bookingsToday: bookingsToday || 0,
          checkinsToday: checkinsToday || 0,
          guestCheckoutsToday: checkoutsToday || 0,
          manualCheckoutsToday: manualCheckoutsToday || 0,
          rewardsActivated: rewardsActivated || 0,
          openExceptions: openExceptions || 0,
        }
      });
    }

    // ── GET /hms-owner/exceptions  ─────────────────────────────────────────────
    if (req.method === 'GET' && resource === 'exceptions') {
      const { data, error } = await supabase
        .from('hms_exceptions')
        .select('*, created_by:created_by_staff_id(name, role), resolved_by_user:resolved_by(name)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return json({ exceptions: data });
    }

    // ── GET /hms-owner/audit-logs  ─────────────────────────────────────────────
    if (req.method === 'GET' && resource === 'audit-logs') {
      const { data, error } = await supabase
        .from('hms_audit_logs')
        .select('*, changed_by:changed_by_staff_id(name)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return json({ audit_logs: data });
    }
    
    // ── GET /hms-owner/rewards  ────────────────────────────────────────────────
    if (req.method === 'GET' && resource === 'rewards') {
      const { data, error } = await supabase
        .from('hms_rewards')
        .select('*, booking:booking_id(booking_code, guest_name)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return json({ rewards: data });
    }

    // ── POST /hms-owner/exceptions/<id>/resolve  ───────────────────────────────
    if (req.method === 'POST' && resource === 'exceptions' && id && action === 'resolve') {
      const { resolution_note } = await req.json();
      
      const { data: exception, error: fetchErr } = await supabase
        .from('hms_exceptions').select('*').eq('id', id).single();
      if (fetchErr || !exception) return json({ error: 'Exception not found' }, 404);

      const { data: updated, error: updateErr } = await supabase
        .from('hms_exceptions')
        .update({
          status: 'Resolved',
          resolved_by: session.staffId,
          resolution_note: resolution_note || null,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();
      if (updateErr) throw updateErr;

      return json({ success: true, exception: updated });
    }

    // ── POST /hms-owner/rewards/<id>/block  ────────────────────────────────────
    if (req.method === 'POST' && resource === 'rewards' && id && action === 'block') {
      const { blocked_reason } = await req.json();
      
      const { data: reward, error: fetchErr } = await supabase
        .from('hms_rewards').select('*').eq('id', id).single();
      if (fetchErr || !reward) return json({ error: 'Reward not found' }, 404);

      if (reward.status === 'Used' || reward.status === 'Expired') {
        return json({ error: `Cannot block a ${reward.status} reward` }, 400);
      }

      const { data: updated, error: updateErr } = await supabase
        .from('hms_rewards')
        .update({
          status: 'Blocked',
          blocked_by: session.staffId,
          blocked_reason: blocked_reason || 'Blocked by owner',
        })
        .eq('id', id)
        .select('*')
        .single();
      if (updateErr) throw updateErr;

      return json({ success: true, reward: updated });
    }

    return json({ error: 'Invalid route' }, 404);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
});

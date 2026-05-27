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

  if (!['OWNER', 'HOUSEKEEPING'].includes(session.role)) {
    return json({ error: 'Only OWNER or HOUSEKEEPING can access this endpoint' }, 403);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const action = pathParts[pathParts.length - 1]; // queue | start | complete

  try {
    // ── GET /hms-housekeeping/queue  → rooms pending cleaning ─────────────────
    if (req.method === 'GET' && action === 'queue') {
      const { data: rooms, error } = await supabase
        .from('hms_rooms')
        .select('*')
        .eq('status', 'Checkout Pending')
        .order('room_number');
      if (error) throw error;

      // Enrich with last booking info
      const enriched = await Promise.all((rooms || []).map(async (room) => {
        const { data: booking } = await supabase
          .from('hms_bookings')
          .select('id,booking_code,guest_name,guest_checkout_time,manager_checkout_time')
          .eq('room_id', room.id)
          .in('booking_status', ['Guest Checked Out', 'Manager Checked Out'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        return { ...room, last_booking: booking };
      }));

      return json({ queue: enriched });
    }

    // ── POST /hms-housekeeping/start  → start cleaning ────────────────────────
    if (req.method === 'POST' && action === 'start') {
      const { room_id, booking_id } = await req.json();
      if (!room_id) return json({ error: 'room_id required' }, 400);

      const { data: room, error: roomErr } = await supabase
        .from('hms_rooms').select('*').eq('id', room_id).single();
      if (roomErr || !room) return json({ error: 'Room not found' }, 404);
      if (room.status !== 'Checkout Pending') {
        return json({ error: `Cannot start cleaning. Room status is ${room.status}, expected Checkout Pending` }, 409);
      }

      const now = new Date().toISOString();
      const year = new Date().getFullYear();

      // Generate cleaning code
      const { data: seqData } = await supabase.rpc('nextval', { seq_name: 'hms_cleaning_seq' }).single();
      const cleaningCode = `CLN-${year}-${String(seqData ?? Date.now()).padStart(6, '0')}`;

      await supabase.from('hms_housekeeping_logs').insert({
        cleaning_code: cleaningCode,
        room_id,
        room_number: room.room_number,
        booking_id: booking_id || null,
        cleaning_start: now,
        cleaned_by: session.staffId,
      });

      // Room → Cleaning
      await supabase.from('hms_rooms').update({ status: 'Cleaning' }).eq('id', room_id);

      await supabase.from('hms_room_status_logs').insert({
        room_id, room_number: room.room_number, booking_id: booking_id || null,
        old_status: 'Checkout Pending', new_status: 'Cleaning',
        changed_by_role: session.role, changed_by_staff_id: session.staffId,
        reason: 'Housekeeping cleaning started',
      });

      await supabase.from('hms_audit_logs').insert({
        action: 'CLEANING_STARTED', entity: 'hms_rooms', entity_id: room_id,
        new_value: 'Cleaning', changed_by_staff_id: session.staffId,
        changed_by_role: session.role, risk_level: 'LOW',
      });

      return json({ success: true, cleaning_code: cleaningCode, started_at: now });
    }

    // ── POST /hms-housekeeping/complete  → finish cleaning ────────────────────
    if (req.method === 'POST' && action === 'complete') {
      const { room_id, booking_id, damage_found, lost_item_found, photo_url, remarks } = await req.json();
      if (!room_id) return json({ error: 'room_id required' }, 400);

      const { data: room, error: roomErr } = await supabase
        .from('hms_rooms').select('*').eq('id', room_id).single();
      if (roomErr || !room) return json({ error: 'Room not found' }, 404);
      if (room.status !== 'Cleaning') {
        return json({ error: `Cannot complete cleaning. Room status is ${room.status}, expected Cleaning` }, 409);
      }

      // Find active cleaning log
      const { data: log, error: logErr } = await supabase
        .from('hms_housekeeping_logs')
        .select('*')
        .eq('room_id', room_id)
        .is('cleaning_end', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (logErr || !log) return json({ error: 'No active cleaning log found for this room' }, 404);

      const now = new Date().toISOString();

      // Update cleaning log
      await supabase.from('hms_housekeeping_logs').update({
        cleaning_end: now,
        damage_found: !!damage_found,
        lost_item_found: !!lost_item_found,
        photo_url: photo_url || null,
        remarks: remarks || null,
      }).eq('id', log.id);

      // Room → Vacant Clean
      await supabase.from('hms_rooms').update({ status: 'Vacant Clean' }).eq('id', room_id);

      // Close booking
      if (booking_id) {
        await supabase.from('hms_bookings').update({ booking_status: 'Closed' }).eq('id', booking_id);
      } else {
        // Try to find and close associated booking
        const { data: booking } = await supabase
          .from('hms_bookings')
          .select('id')
          .eq('room_id', room_id)
          .in('booking_status', ['Guest Checked Out', 'Manager Checked Out', 'Cleaning Pending'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (booking) {
          await supabase.from('hms_bookings').update({ booking_status: 'Closed' }).eq('id', booking.id);
        }
      }

      await supabase.from('hms_room_status_logs').insert({
        room_id, room_number: room.room_number, booking_id: booking_id || null,
        old_status: 'Cleaning', new_status: 'Vacant Clean',
        changed_by_role: session.role, changed_by_staff_id: session.staffId,
        reason: 'Housekeeping cleaning completed',
      });

      await supabase.from('hms_audit_logs').insert({
        action: 'CLEANING_COMPLETED', entity: 'hms_rooms', entity_id: room_id,
        new_value: 'Vacant Clean', changed_by_staff_id: session.staffId,
        changed_by_role: session.role, risk_level: 'LOW',
      });

      return json({
        success: true,
        completed_at: now,
        damage_found: !!damage_found,
        lost_item_found: !!lost_item_found,
        room_status: 'Vacant Clean',
      });
    }

    return json({ error: 'Unknown action' }, 404);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
});

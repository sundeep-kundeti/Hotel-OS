import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-hms-session',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

const VALID_REASONS = [
  'Guest left in hurry',
  'Guest phone not working',
  'Guest refused',
  'Staff entered manually',
  'Other',
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const session = validateSession(req);
  if (!session) return json({ error: 'Unauthorized' }, 401);
  if (!['OWNER', 'MANAGER'].includes(session.role)) {
    return json({ error: 'Only OWNER or MANAGER can perform manual checkout' }, 403);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const bookingCode = pathParts[pathParts.length - 1];
  if (!bookingCode || bookingCode === 'hms-manual-checkout') {
    return json({ error: 'Booking code required' }, 400);
  }

  try {
    const { reason, remarks } = await req.json();
    if (!reason || !VALID_REASONS.includes(reason)) {
      return json({ error: `Reason required. Must be one of: ${VALID_REASONS.join(', ')}` }, 400);
    }

    const { data: booking, error } = await supabase
      .from('hms_bookings').select('*').eq('booking_code', bookingCode).single();
    if (error || !booking) return json({ error: 'Booking not found' }, 404);
    if (booking.booking_status !== 'Checked In') {
      return json({ error: `Cannot manually check out. Status: ${booking.booking_status}` }, 409);
    }

    const now = new Date().toISOString();

    await supabase.from('hms_bookings').update({
      manager_checkout_time: now,
      booking_status: 'Manager Checked Out',
      manual_checkout_reason: reason,
      remarks: remarks || booking.remarks,
    }).eq('id', booking.id);

    await supabase.from('hms_rooms').update({ status: 'Checkout Pending' }).eq('id', booking.room_id);

    await supabase.from('hms_rewards')
      .update({ status: 'Not Activated' })
      .eq('booking_id', booking.id)
      .in('status', ['Inactive', 'Pending Activation']);

    await supabase.from('hms_room_status_logs').insert({
      room_id: booking.room_id,
      room_number: booking.room_number,
      booking_id: booking.id,
      old_status: 'Occupied',
      new_status: 'Checkout Pending',
      changed_by_role: session.role,
      changed_by_staff_id: session.staffId,
      reason: `Manual checkout by ${session.role}: ${reason}`,
    });

    await supabase.from('hms_audit_logs').insert({
      action: 'MANAGER_MANUAL_CHECKOUT',
      entity: 'hms_bookings',
      entity_id: booking.id,
      old_value: 'Checked In',
      new_value: 'Manager Checked Out',
      changed_by_staff_id: session.staffId,
      changed_by_role: session.role,
      reason,
      risk_level: 'HIGH',
    });

    await supabase.from('hms_exceptions').insert({
      booking_id: booking.id,
      room_id: booking.room_id,
      room_number: booking.room_number,
      exception_type: 'MANAGER_CHECKOUT_WITHOUT_GUEST',
      description: `${session.name} (${session.role}) manually checked out ${bookingCode} without guest digital checkout. Reason: ${reason}`,
      risk_level: 'HIGH',
      created_by_staff_id: session.staffId,
    });

    return json({
      success: true,
      booking_code: bookingCode,
      room_number: booking.room_number,
      checkout_time: now,
      reward_status: 'Not Activated',
    });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
});

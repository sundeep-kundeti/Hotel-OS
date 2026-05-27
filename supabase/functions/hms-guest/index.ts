import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `HSS100-${suffix}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  // Expected: /functions/v1/hms-guest/<action>/<booking_code>
  // action = checkin | checkout
  const action = pathParts[pathParts.length - 2];      // 'checkin' | 'checkout'
  const bookingCode = pathParts[pathParts.length - 1]; // 'HSS-2026-000001'
  const token = url.searchParams.get('token') || '';

  if (!bookingCode || bookingCode === 'hms-guest') {
    return json({ error: 'Booking code required' }, 400);
  }

  try {
    // ── GET /hms-guest/checkin/<booking_code>?token=xxx ───────────────────────
    if (req.method === 'GET' && action === 'checkin') {
      const { data: booking, error } = await supabase
        .from('hms_bookings')
        .select('booking_code,guest_name,room_number,room_type,checkin_expected,checkout_expected,booking_status,checkin_token,amount')
        .eq('booking_code', bookingCode)
        .single();

      if (error || !booking) return json({ error: 'Booking not found' }, 404);
      if (booking.booking_status === 'Cancelled') return json({ error: 'Booking is cancelled' }, 410);
      if (booking.checkin_actual) return json({ error: 'Already checked in' }, 409);
      if (booking.checkin_token !== token) return json({ error: 'Invalid check-in link' }, 401);

      return json({
        booking_code: booking.booking_code,
        guest_name: booking.guest_name,
        room_number: booking.room_number,
        room_type: booking.room_type,
        checkin_expected: booking.checkin_expected,
        checkout_expected: booking.checkout_expected,
        amount: booking.amount,
      });
    }

    // ── POST /hms-guest/checkin/<booking_code>  → complete check-in ───────────
    if (req.method === 'POST' && action === 'checkin') {
      const body = await req.json();
      const { token: bodyToken, confirm_checked_in, id_confirmed, terms_confirmed } = body;

      const { data: booking, error } = await supabase
        .from('hms_bookings')
        .select('*')
        .eq('booking_code', bookingCode)
        .single();

      if (error || !booking) return json({ error: 'Booking not found' }, 404);
      if (booking.checkin_token !== (bodyToken || token)) return json({ error: 'Invalid check-in token' }, 401);
      if (booking.booking_status !== 'Pending Check-In') {
        return json({ error: `Cannot check in. Current status: ${booking.booking_status}` }, 409);
      }
      if (!confirm_checked_in) return json({ error: 'Please confirm you have checked into the room' }, 400);

      const now = new Date().toISOString();

      // Update booking
      await supabase.from('hms_bookings').update({
        checkin_actual: now,
        booking_status: 'Checked In',
      }).eq('id', booking.id);

      // Update room → Occupied
      await supabase.from('hms_rooms').update({ status: 'Occupied' }).eq('id', booking.room_id);

      // Log room status
      await supabase.from('hms_room_status_logs').insert({
        room_id: booking.room_id,
        room_number: booking.room_number,
        booking_id: booking.id,
        old_status: 'Pending Check-In',
        new_status: 'Occupied',
        changed_by_role: 'GUEST',
        changed_by_guest_phone: booking.guest_phone,
        reason: 'Guest digital check-in completed',
      });

      // Audit log
      await supabase.from('hms_audit_logs').insert({
        action: 'GUEST_CHECKIN',
        entity: 'hms_bookings',
        entity_id: booking.id,
        new_value: 'Checked In',
        changed_by_role: 'GUEST',
        risk_level: 'LOW',
      });

      // Create INACTIVE reward
      const year = new Date().getFullYear();
      const { data: seqData } = await supabase.rpc('nextval', { seq_name: 'hms_reward_seq' }).single();
      const rewardCode = `RWD-${year}-${String(seqData ?? Date.now()).padStart(6, '0')}`;
      const couponCode = generateCouponCode();
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days

      await supabase.from('hms_rewards').insert({
        reward_code: rewardCode,
        booking_id: booking.id,
        guest_phone: booking.guest_phone,
        coupon_code: couponCode,
        coupon_value: 100,
        status: 'Inactive',
        expires_at: expiresAt,
      });

      return json({
        success: true,
        message: 'Check-in completed! Your ₹100 reward has been created. Complete checkout before leaving to activate it.',
        reward_code: rewardCode,
        checkin_time: now,
      });
    }

    // ── GET /hms-guest/checkout/<booking_code>?token=xxx ─────────────────────
    if (req.method === 'GET' && action === 'checkout') {
      const { data: booking, error } = await supabase
        .from('hms_bookings')
        .select('booking_code,guest_name,room_number,checkin_actual,checkout_expected,booking_status,checkout_token,amount')
        .eq('booking_code', bookingCode)
        .single();

      if (error || !booking) return json({ error: 'Booking not found' }, 404);
      if (booking.checkout_token !== token) return json({ error: 'Invalid checkout link' }, 401);
      if (!booking.checkin_actual) return json({ error: 'Check-in not yet completed' }, 409);
      if (booking.guest_checkout_time) return json({ error: 'Already checked out' }, 409);

      return json({
        booking_code: booking.booking_code,
        guest_name: booking.guest_name,
        room_number: booking.room_number,
        checkin_actual: booking.checkin_actual,
        checkout_expected: booking.checkout_expected,
        amount: booking.amount,
      });
    }

    // ── POST /hms-guest/checkout/<booking_code>  → complete checkout ──────────
    if (req.method === 'POST' && action === 'checkout') {
      const body = await req.json();
      const { token: bodyToken, guest_phone, confirm_vacated, rating, feedback } = body;

      const { data: booking, error } = await supabase
        .from('hms_bookings')
        .select('*')
        .eq('booking_code', bookingCode)
        .single();

      if (error || !booking) return json({ error: 'Booking not found' }, 404);
      if (booking.checkout_token !== (bodyToken || token)) return json({ error: 'Invalid checkout token' }, 401);
      if (booking.booking_status !== 'Checked In') {
        return json({ error: `Cannot check out. Current status: ${booking.booking_status}` }, 409);
      }
      if (!confirm_vacated) return json({ error: 'Please confirm you have vacated the room' }, 400);
      // Phone verification
      if (guest_phone && booking.guest_phone !== guest_phone.replace(/\D/g, '')) {
        return json({ error: 'Phone number does not match booking' }, 401);
      }

      const now = new Date().toISOString();

      // Update booking → Guest Checked Out
      await supabase.from('hms_bookings').update({
        guest_checkout_time: now,
        booking_status: 'Guest Checked Out',
        rating: rating || null,
        feedback: feedback || null,
      }).eq('id', booking.id);

      // Room → Checkout Pending (NOT Vacant Clean)
      await supabase.from('hms_rooms').update({ status: 'Checkout Pending' }).eq('id', booking.room_id);

      // Log room status
      await supabase.from('hms_room_status_logs').insert({
        room_id: booking.room_id,
        room_number: booking.room_number,
        booking_id: booking.id,
        old_status: 'Occupied',
        new_status: 'Checkout Pending',
        changed_by_role: 'GUEST',
        changed_by_guest_phone: booking.guest_phone,
        reason: 'Guest digital checkout completed',
      });

      // Audit log
      await supabase.from('hms_audit_logs').insert({
        action: 'GUEST_CHECKOUT',
        entity: 'hms_bookings',
        entity_id: booking.id,
        new_value: 'Guest Checked Out',
        changed_by_role: 'GUEST',
        risk_level: 'LOW',
      });

      // Activate reward if payment is Paid
      const { data: reward } = await supabase
        .from('hms_rewards')
        .select('*')
        .eq('booking_id', booking.id)
        .eq('status', 'Inactive')
        .single();

      let activatedReward = null;
      if (reward && booking.payment_status === 'Paid') {
        await supabase.from('hms_rewards').update({
          status: 'Active',
          activated_at: now,
        }).eq('id', reward.id);
        activatedReward = { coupon_code: reward.coupon_code, coupon_value: reward.coupon_value, expires_at: reward.expires_at };
      } else if (reward) {
        // Payment not confirmed — mark as Pending Activation
        await supabase.from('hms_rewards').update({ status: 'Pending Activation' }).eq('id', reward.id);
      }

      return json({
        success: true,
        checkout_time: now,
        reward: activatedReward,
        message: activatedReward
          ? `Thank you for staying! Your ₹100 coupon ${activatedReward.coupon_code} is now active.`
          : 'Thank you for staying! Your reward will be reviewed and activated shortly.',
      });
    }

    return json({ error: 'Invalid route' }, 404);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
});

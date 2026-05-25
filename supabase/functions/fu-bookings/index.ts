import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── Time utilities ─────────────────────────────────────────────────────────
function getLocalISTDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}
function getLocalISTTime(): string {
  return new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
}
function addHoursToTime(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + hours * 60;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
function addMinutesToTime(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
function checkTimeOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return s1 < e2 && e1 > s2;
}
function generateBookingCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const prefix = letters[Math.floor(Math.random() * 24)] + letters[Math.floor(Math.random() * 24)];
  const num = Math.floor(100000 + Math.random() * 900000);
  return `FUR-${prefix}${num}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const body = await req.json();

    if (!body.roomNumber || !body.bookingDate || !body.startTime || !body.customer) {
      return new Response(JSON.stringify({ error: 'Missing required payload keys.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const today = getLocalISTDate();
    const now = getLocalISTTime();
    const [h, m] = now.split(':').map(Number);
    const graceMin = h * 60 + m - 2;
    const graceTime = `${String(Math.floor(graceMin / 60)).padStart(2, '0')}:${String(graceMin % 60).padStart(2, '0')}`;

    if (body.bookingDate < today || (body.bookingDate === today && body.startTime < graceTime)) {
      return new Response(JSON.stringify({ error: 'System Time Check Failed: Cannot secure bookings for elapsed local timeframes.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Basic customer validation
    const c = body.customer;
    if (!c.fullName || !c.mobileNumber || !c.gender || !c.paxCount || !c.aadhaarName || !c.aadhaarNumber) {
      return new Response(JSON.stringify({ error: 'Validation failed: missing customer fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const endTime = addHoursToTime(body.startTime, body.durationHours);
    const cleaningEndTime = addMinutesToTime(endTime, 30);

    // Deduplication
    const { data: guestBookings } = await supabase
      .from('fresh_up_bookings')
      .select('start_time, room_number')
      .eq('booking_date', body.bookingDate)
      .or(`mobile_number.eq.${c.mobileNumber},aadhaar_number.eq.${c.aadhaarNumber}`)
      .in('status', ['confirmed', 'checked_in', 'cleaning']);

    if (guestBookings && guestBookings.length > 0) {
      const newStartMins = parseInt(body.startTime.split(':')[0]) * 60 + parseInt(body.startTime.split(':')[1]);
      for (const existing of guestBookings) {
        const exMins = parseInt(existing.start_time.split(':')[0]) * 60 + parseInt(existing.start_time.split(':')[1]);
        if (Math.abs(newStartMins - exMins) < 60) {
          return new Response(JSON.stringify({ error: `Verification Failed: A room (${existing.room_number}) is already secured under your identity for this timeframe.` }), {
            status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Conflict check
    const { data: conflicts } = await supabase
      .from('fresh_up_bookings')
      .select('booking_date, start_time, cleaning_end_time')
      .eq('room_number', body.roomNumber)
      .eq('booking_date', body.bookingDate)
      .in('status', ['confirmed', 'checked_in', 'cleaning']);

    const hasOverlap = (conflicts ?? []).some((c: any) =>
      checkTimeOverlap(body.startTime, cleaningEndTime, c.start_time, c.cleaning_end_time),
    );
    if (hasOverlap) {
      return new Response(JSON.stringify({ error: 'Conflict: This timeframe was just secured by another guest.' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const bookingCode = generateBookingCode();
    const { data, error: insertError } = await supabase
      .from('fresh_up_bookings')
      .insert({
        booking_code: bookingCode,
        room_number: body.roomNumber,
        guest_name: c.fullName,
        mobile_number: c.mobileNumber,
        alternate_mobile_number: c.alternateMobileNumber || null,
        gender: c.gender,
        pax_count: c.paxCount,
        aadhaar_name: c.aadhaarName,
        aadhaar_number: c.aadhaarNumber,
        aadhaar_district: c.aadhaarDistrict,
        aadhaar_state: c.aadhaarState,
        declaration_outside_tirupati: c.declarationOutsideTirupati,
        declaration_aadhaar_verification_accepted: c.declarationAadhaarVerificationAccepted,
        declaration_pay_at_hotel_accepted: c.declarationPayAtHotelAccepted,
        booking_date: body.bookingDate,
        start_time: body.startTime,
        end_time: endTime,
        cleaning_end_time: cleaningEndTime,
        duration_hours: body.durationHours,
        amount: body.amount,
        payment_mode: 'pay_at_hotel',
        payment_status: 'pending',
        status: 'confirmed',
        verification_status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({
      bookingId: data.id, bookingCode, status: 'confirmed',
      roomNumber: body.roomNumber, bookingDate: body.bookingDate,
      startTime: body.startTime, endTime, cleaningEndTime, amount: body.amount, paymentMode: 'pay_at_hotel',
    }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

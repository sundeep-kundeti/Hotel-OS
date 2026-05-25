import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// ── Time utilities (inlined from freshUp.time.ts) ──────────────────────────
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const startTime = url.searchParams.get('startTime');
    const duration = url.searchParams.get('durationHours');

    if (!date || !startTime || !duration) {
      return new Response(JSON.stringify({ error: 'Missing required search parameters' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const durationHours = parseInt(duration, 10);
    const bookingEndTime = addHoursToTime(startTime, durationHours);
    const cleaningEndTime = addMinutesToTime(bookingEndTime, 30);

    const { data: rooms, error: roomsError } = await supabase
      .from('fresh_up_rooms').select('*').eq('is_primary', true).order('room_number', { ascending: true });
    if (roomsError) throw roomsError;

    const { data: bookings, error: bookingsError } = await supabase
      .from('fresh_up_bookings')
      .select('room_number, booking_date, start_time, cleaning_end_time')
      .eq('booking_date', date)
      .in('status', ['confirmed', 'checked_in', 'cleaning']);
    if (bookingsError) throw bookingsError;

    const availableRooms = (rooms ?? []).map((room: any) => {
      const roomBookings = (bookings ?? []).filter((b: any) => b.room_number === room.room_number);
      let isAvailableForSlot = true;
      let nextAvailableTime: string | undefined;
      for (const b of roomBookings) {
        if (checkTimeOverlap(startTime, cleaningEndTime, b.start_time, b.cleaning_end_time)) {
          isAvailableForSlot = false;
          nextAvailableTime = b.cleaning_end_time.slice(0, 5);
        }
      }
      return {
        roomNumber: room.room_number,
        floor: room.floor,
        isPrimary: room.is_primary,
        status: isAvailableForSlot ? 'available' : 'booked',
        matchedSlotAvailable: isAvailableForSlot,
        matchedSlotReason: isAvailableForSlot ? undefined : 'Room is pre-booked for this timeslot.',
        nextAvailableTime,
      };
    });

    return new Response(JSON.stringify({ availableRooms }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

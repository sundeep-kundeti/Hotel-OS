import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Scheduled function (cron) to detect anomalies in the HMS
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // Require service role key for cron execution or secure manual trigger
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
    return json({ error: 'Unauthorized. Service role required.' }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const exceptionsCreated = [];

  try {
    const now = new Date();

    // 1. Detect rooms in "Cleaning" for > 4 hours
    const { data: cleaningRooms } = await supabase
      .from('hms_rooms')
      .select('*')
      .eq('status', 'Cleaning');
    
    if (cleaningRooms) {
      for (const room of cleaningRooms) {
        // Find latest cleaning log
        const { data: log } = await supabase
          .from('hms_housekeeping_logs')
          .select('*')
          .eq('room_id', room.id)
          .is('cleaning_end', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (log && new Date(log.cleaning_start).getTime() < now.getTime() - 4 * 60 * 60 * 1000) {
          // Check if exception already exists
          const { data: existing } = await supabase
            .from('hms_exceptions')
            .select('id')
            .eq('room_id', room.id)
            .eq('exception_type', 'LONG_CLEANING')
            .eq('status', 'Open')
            .single();

          if (!existing) {
            const { data: exc } = await supabase.from('hms_exceptions').insert({
              room_id: room.id,
              room_number: room.room_number,
              exception_type: 'LONG_CLEANING',
              description: `Room ${room.room_number} has been in Cleaning status for over 4 hours.`,
              risk_level: 'MEDIUM',
            }).select('id').single();
            if (exc) exceptionsCreated.push(exc.id);
          }
        }
      }
    }

    // 2. Detect bookings "Pending Check-In" past checkout date
    const { data: staleBookings } = await supabase
      .from('hms_bookings')
      .select('*')
      .eq('booking_status', 'Pending Check-In')
      .lt('checkout_expected', now.toISOString());

    if (staleBookings) {
      for (const booking of staleBookings) {
        const { data: existing } = await supabase
          .from('hms_exceptions')
          .select('id')
          .eq('booking_id', booking.id)
          .eq('exception_type', 'NO_SHOW_NOT_CANCELLED')
          .eq('status', 'Open')
          .single();

        if (!existing) {
          const { data: exc } = await supabase.from('hms_exceptions').insert({
            booking_id: booking.id,
            room_id: booking.room_id,
            room_number: booking.room_number,
            exception_type: 'NO_SHOW_NOT_CANCELLED',
            description: `Booking ${booking.booking_code} is past checkout date but still Pending Check-In. Needs to be cancelled.`,
            risk_level: 'LOW',
          }).select('id').single();
          if (exc) exceptionsCreated.push(exc.id);
        }
      }
    }

    return json({ success: true, exceptionsCreated: exceptionsCreated.length });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
});

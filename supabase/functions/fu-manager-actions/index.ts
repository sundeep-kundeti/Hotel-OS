import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const body = await req.json();
    const { bookingId, action, payload } = body;
    let updatePayload: Record<string, unknown> = {};

    switch (action) {
      case 'verify':
        updatePayload = { verification_status: payload?.result || 'verified' };
        break;
      case 'check_in':
        updatePayload = { status: 'checked_in', payment_status: 'paid' };
        break;
      case 'record_payment':
        updatePayload = { payment_status: 'paid' };
        break;
      case 'check_out':
        updatePayload = { status: 'cleaning', housekeeper_name: payload?.housekeeperName };
        break;
      case 'completed':
        updatePayload = { status: 'completed', housekeeper_name: payload?.housekeeperName };
        break;
      case 'reassign': {
        const newRoom = payload?.roomNumber;
        const { data: cb } = await supabase.from('fresh_up_bookings').select('*').eq('id', bookingId).single();
        if (cb && newRoom) {
          const { data: conflicts } = await supabase
            .from('fresh_up_bookings')
            .select('*')
            .eq('room_number', newRoom)
            .eq('booking_date', cb.booking_date)
            .neq('id', bookingId)
            .neq('status', 'cancelled')
            .neq('status', 'rejected')
            .lt('start_time', cb.cleaning_end_time)
            .gt('cleaning_end_time', cb.start_time);
          if (conflicts && conflicts.length > 0) {
            return new Response(JSON.stringify({ error: `Room ${newRoom} cannot be forced. It currently violates an active physical cleaning/occupation block.` }), {
              status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
        updatePayload = { room_number: newRoom, manager_remarks: `[REASSIGNED] Reason: ${payload?.reason}` };
        break;
      }
      case 'cancel':
        updatePayload = { status: 'cancelled', manager_remarks: payload?.reason };
        break;
      default:
        return new Response(JSON.stringify({ error: 'Unrecognized lifecycle state enforcement.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const { error, data } = await supabase.from('fresh_up_bookings').update(updatePayload).eq('id', bookingId).select('*');
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, booking: data?.[0] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

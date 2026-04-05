import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../lib/supabaseServer';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, action, payload } = body;

    let updatePayload: any = {};

    switch (action) {
       case 'verify':
          updatePayload = {
             verification_status: payload?.result || 'verified',
          };
          break;
       case 'check_in':
          updatePayload = { status: 'checked_in' };
          break;
       case 'check_out':
          updatePayload = { status: 'cleaning', housekeeper_name: payload?.housekeeperName };
          break;
       case 'completed':
          updatePayload = { status: 'completed', housekeeper_name: payload?.housekeeperName };
          break;
       case 'reassign':
          const newRoom = payload?.roomNumber;
          // Step 1: Secure current bounds
          const { data: cb } = await supabaseServer.from('fresh_up_bookings').select('*').eq('id', bookingId).single();
          if (cb && newRoom) {
             // Step 2: Ensure the target room isn't overlapping
             const { data: conflicts } = await supabaseServer
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
                 return NextResponse.json({ error: `Room ${newRoom} cannot be forced. It currently violates an active physical cleaning/occupation block.` }, { status: 409 });
             }
          }

          updatePayload = { 
             room_number: payload?.roomNumber,
             manager_remarks: `[REASSIGNED] Reason: ${payload?.reason}`
          };
          break;
       case 'cancel':
          updatePayload = { 
             status: 'cancelled',
             manager_remarks: payload?.reason
          };
          break;
       default:
          return NextResponse.json({ error: 'Unrecognized lifecycle state enforcement.' }, { status: 400 });
    }

    const { error, data } = await supabaseServer
       .from('fresh_up_bookings')
       .update(updatePayload)
       .eq('id', bookingId)
       .select('*');
       
    if (error) throw error;

    return NextResponse.json({ success: true, booking: data?.[0] });

  } catch (err: any) {
    console.error('Manager Operations Engine Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

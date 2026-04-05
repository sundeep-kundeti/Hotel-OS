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
          updatePayload = { status: 'cleaning' }; // Instantly blocks room and requests cleaning
          break;
       case 'completed':
          updatePayload = { status: 'completed' }; // Releases room to pool
          break;
       case 'reassign':
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

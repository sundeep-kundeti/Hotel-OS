import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../lib/supabaseServer';

export const runtime = 'edge';

function getStaffUsername(request: NextRequest): string {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/tp_session=([^;]+)/);
  if (match) {
    try {
      const decoded = JSON.parse(atob(match[1]));
      return decoded.username || 'manager';
    } catch {}
  }
  return 'manager';
}

// GET /api/travel-partners/:id/commissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseServer
      .from('commission_entries')
      .select('*')
      .eq('partner_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ commissions: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/travel-partners/:id/commissions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const commissionAmount = Number(body.commission_amount);
    if (!commissionAmount || commissionAmount <= 0) {
      return NextResponse.json({ error: 'commission_amount must be a positive number' }, { status: 400 });
    }

    const enteredBy = getStaffUsername(request);
    const d = {
      customer_name: body.customer_name || null,
      room_number: body.room_number || null,
      booking_amount: Number(body.booking_amount) || 0,
      commission_amount: commissionAmount,
      commission_status: body.commission_status || 'Pending',
      payment_mode: body.payment_mode || 'Pending',
      notes: body.notes || null,
    };

    const { data: commission, error } = await supabaseServer
      .from('commission_entries')
      .insert({
        partner_id: id,
        customer_name: d.customer_name,
        room_number: d.room_number,
        booking_amount: d.booking_amount,
        commission_amount: d.commission_amount,
        commission_status: d.commission_status,
        payment_mode: d.payment_mode,
        notes: d.notes,
        entered_by: enteredBy,
        paid_at: d.commission_status === 'Paid' ? new Date().toISOString() : null,
      })
      .select('*')
      .single();

    if (error) throw error;

    // Update partner's last_contacted_at
    await supabaseServer
      .from('travel_partners')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ commission }, { status: 201 });
  } catch (error: any) {
    console.error('Add commission error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

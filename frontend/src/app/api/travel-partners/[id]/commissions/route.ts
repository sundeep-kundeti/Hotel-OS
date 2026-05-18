import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../lib/supabaseServer';
import { createCommissionSchema } from '../../../../../features/travel-partners/schemas/travelPartner.schemas';

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

    const parsed = createCommissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const enteredBy = getStaffUsername(request);
    const d = parsed.data;

    const { data: commission, error } = await supabaseServer
      .from('commission_entries')
      .insert({
        partner_id: id,
        customer_name: d.customer_name || null,
        room_number: d.room_number || null,
        booking_amount: d.booking_amount,
        commission_amount: d.commission_amount,
        commission_status: d.commission_status,
        payment_mode: d.payment_mode,
        notes: d.notes || null,
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

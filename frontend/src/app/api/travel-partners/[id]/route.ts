import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer';

export const runtime = 'edge';

// GET /api/travel-partners/:id — partner profile + commission summary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: partner, error: partnerError } = await supabaseServer
      .from('travel_partners')
      .select('*')
      .eq('id', id)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Aggregate commission summary
    const { data: commissions, error: commError } = await supabaseServer
      .from('commission_entries')
      .select('commission_amount, commission_status')
      .eq('partner_id', id);

    if (commError) throw commError;

    const totalBookings = commissions?.length || 0;
    const totalCommission = commissions?.reduce((s, r) => s + (r.commission_amount || 0), 0) || 0;
    const totalPaid = commissions
      ?.filter((r) => r.commission_status === 'Paid')
      .reduce((s, r) => s + (r.commission_amount || 0), 0) || 0;
    const totalPending = commissions
      ?.filter((r) => r.commission_status === 'Pending')
      .reduce((s, r) => s + (r.commission_amount || 0), 0) || 0;

    return NextResponse.json({
      partner,
      summary: {
        total_bookings: totalBookings,
        total_commission: totalCommission,
        total_paid: totalPaid,
        total_pending: totalPending,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/travel-partners/:id — update partner details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Allow updating: partner_status, notes, driver_name, vehicle_make, is_active
    const allowed = ['partner_status', 'notes', 'driver_name', 'vehicle_make', 'is_active', 'last_contacted_at'];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: partner, error } = await supabaseServer
      .from('travel_partners')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ partner });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

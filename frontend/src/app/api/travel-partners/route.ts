import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer';
import { createPartnerSchema } from '../../../features/travel-partners/schemas/travelPartner.schemas';
import { getTodayIST } from '../../../features/travel-partners/utils/normalize';

export const runtime = 'edge';

// GET /api/travel-partners — list all partners (for reports overview)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseServer
      .from('travel_partners')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('partner_status', status);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ partners: data, total: count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/travel-partners — create new partner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = createPartnerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Get logged-in staff username from cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const tpSessionMatch = cookieHeader.match(/tp_session=([^;]+)/);
    let createdBy = 'manager';
    if (tpSessionMatch) {
      try {
        const decoded = JSON.parse(atob(tpSessionMatch[1]));
        createdBy = decoded.username || 'manager';
      } catch {}
    }

    const { data: partner, error } = await supabaseServer
      .from('travel_partners')
      .insert({
        phone_number: data.phone_number,
        vehicle_number: data.vehicle_number,
        driver_name: data.driver_name || null,
        vehicle_make: data.vehicle_make || null,
        lead_source: data.lead_source,
        partner_status: data.partner_status,
        notes: data.notes || null,
        created_by: createdBy,
        is_active: true,
      })
      .select('*')
      .single();

    if (error) {
      // Unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A partner with this phone number and vehicle number already exists.' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ partner }, { status: 201 });
  } catch (error: any) {
    console.error('Create partner error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/travel-partners/stats — dashboard stats
export async function HEAD(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}

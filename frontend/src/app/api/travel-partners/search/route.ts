import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer';
import { normalizePhoneNumber, normalizeVehicleNumber } from '../../../../features/travel-partners/utils/normalize';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'phone' | 'vehicle'
    const value = searchParams.get('value');

    if (!type || !value) {
      return NextResponse.json({ error: 'Missing type or value parameter' }, { status: 400 });
    }
    if (type !== 'phone' && type !== 'vehicle') {
      return NextResponse.json({ error: 'type must be phone or vehicle' }, { status: 400 });
    }

    // Normalize search value
    const normalized =
      type === 'phone'
        ? normalizePhoneNumber(value.trim())
        : normalizeVehicleNumber(value.trim());

    if (!normalized) {
      return NextResponse.json({ found: false, results: [] });
    }

    const column = type === 'phone' ? 'phone_number' : 'vehicle_number';

    const { data, error } = await supabaseServer
      .from('travel_partners')
      .select('*')
      .eq(column, normalized)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      found: data.length > 0,
      results: data,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

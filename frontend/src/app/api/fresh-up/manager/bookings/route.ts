import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../lib/supabaseServer';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');

  try {
    let query = supabaseServer
      .from('fresh_up_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (date) {
      query = query.eq('booking_date', date);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ bookings: data });
  } catch (error: any) {
    console.error('Manager Booking Lookup Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

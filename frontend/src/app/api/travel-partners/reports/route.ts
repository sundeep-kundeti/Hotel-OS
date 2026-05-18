import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer';
import { getTodayIST } from '../../../../features/travel-partners/utils/normalize';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'today_leads';
    const today = getTodayIST();
    const todayStart = `${today}T00:00:00+05:30`;
    const todayEnd = `${today}T23:59:59+05:30`;

    switch (type) {
      case 'today_leads': {
        const { data, error } = await supabaseServer
          .from('travel_partners')
          .select('*')
          .gte('created_at', todayStart)
          .lte('created_at', todayEnd)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json({ report: data, type });
      }

      case 'today_commissions': {
        const { data, error } = await supabaseServer
          .from('commission_entries')
          .select('*, travel_partners(driver_name, vehicle_number, phone_number)')
          .gte('created_at', todayStart)
          .lte('created_at', todayEnd)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json({ report: data, type });
      }

      case 'pending_commissions': {
        const { data, error } = await supabaseServer
          .from('commission_entries')
          .select('*, travel_partners(driver_name, vehicle_number, phone_number)')
          .eq('commission_status', 'Pending')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json({ report: data, type });
      }

      case 'paid_commissions': {
        const { data, error } = await supabaseServer
          .from('commission_entries')
          .select('*, travel_partners(driver_name, vehicle_number, phone_number)')
          .eq('commission_status', 'Paid')
          .order('paid_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json({ report: data, type });
      }

      case 'active_partners': {
        const { data, error } = await supabaseServer
          .from('travel_partners')
          .select('*')
          .eq('partner_status', 'Active Partner')
          .eq('is_active', true)
          .order('last_contacted_at', { ascending: false, nullsFirst: false });
        if (error) throw error;
        return NextResponse.json({ report: data, type });
      }

      case 'lead_only': {
        const { data, error } = await supabaseServer
          .from('travel_partners')
          .select('*')
          .eq('partner_status', 'Lead Only')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json({ report: data, type });
      }

      default:
        return NextResponse.json({ error: 'Unknown report type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Reports error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer';
import { getTodayIST } from '../../../../features/travel-partners/utils/normalize';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const today = getTodayIST();
    const todayStart = `${today}T00:00:00+05:30`;
    const todayEnd = `${today}T23:59:59+05:30`;

    // Today leads count
    const { count: todayLeads } = await supabaseServer
      .from('travel_partners')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd);

    // Today commissions count
    const { count: todayCommissions } = await supabaseServer
      .from('commission_entries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd);

    // Pending commission total
    const { data: pendingData } = await supabaseServer
      .from('commission_entries')
      .select('commission_amount')
      .eq('commission_status', 'Pending');

    const pendingAmount = (pendingData || []).reduce(
      (sum, r) => sum + (r.commission_amount || 0),
      0
    );

    // Active partners count
    const { count: activePartners } = await supabaseServer
      .from('travel_partners')
      .select('*', { count: 'exact', head: true })
      .eq('partner_status', 'Active Partner')
      .eq('is_active', true);

    return NextResponse.json({
      today_leads: todayLeads || 0,
      today_commissions: todayCommissions || 0,
      pending_commission_amount: pendingAmount,
      active_partners: activePartners || 0,
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

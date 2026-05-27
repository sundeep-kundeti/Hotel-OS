import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-tp-session',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function validateSession(req: Request): string | null {
  // Token travels in X-TP-Session (Authorization carries the Supabase anon key for gateway)
  const token = (req.headers.get('x-tp-session') || '').trim();
  if (!token) return null;
  try {
    const decoded = JSON.parse(atob(token));
    if (!decoded.username || !decoded.loginAt) return null;
    const loginTime = new Date(decoded.loginAt).getTime();
    if (Date.now() - loginTime > 12 * 60 * 60 * 1000) return null;
    return decoded.username as string;
  } catch {
    return null;
  }
}

function getTodayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const username = validateSession(req);
  if (!username) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const today = getTodayIST();
    const todayStart = `${today}T00:00:00+05:30`;
    const todayEnd = `${today}T23:59:59+05:30`;

    const [
      { count: todayLeads },
      { count: todayCommissions },
      { data: todayCommData },
      { count: activePartners },
    ] = await Promise.all([
      supabase.from('travel_partners').select('*', { count: 'exact', head: true }).gte('created_at', todayStart).lte('created_at', todayEnd),
      supabase.from('commission_entries').select('*', { count: 'exact', head: true }).gte('created_at', todayStart).lte('created_at', todayEnd),
      supabase.from('commission_entries').select('commission_amount').gte('created_at', todayStart).lte('created_at', todayEnd),
      supabase.from('travel_partners').select('*', { count: 'exact', head: true }).eq('partner_status', 'Active Partner').eq('is_active', true),
    ]);

    const todayCommissionAmount = (todayCommData || []).reduce((sum, r) => sum + (r.commission_amount || 0), 0);

    return new Response(
      JSON.stringify({
        today_leads: todayLeads || 0,
        today_commissions: todayCommissions || 0,
        today_commission_amount: todayCommissionAmount,
        active_partners: activePartners || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

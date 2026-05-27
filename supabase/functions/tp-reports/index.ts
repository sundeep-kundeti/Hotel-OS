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
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'today_leads';
    const today = getTodayIST();
    const todayStart = `${today}T00:00:00+05:30`;
    const todayEnd = `${today}T23:59:59+05:30`;

    let data: unknown[] = [];

    switch (type) {
      case 'today_leads': {
        const res = await supabase.from('travel_partners').select('*').gte('created_at', todayStart).lte('created_at', todayEnd).order('created_at', { ascending: false });
        if (res.error) throw res.error;
        data = res.data || [];
        break;
      }
      case 'today_commissions': {
        const res = await supabase.from('commission_entries').select('*, travel_partners(driver_name, vehicle_number, phone_number)').gte('created_at', todayStart).lte('created_at', todayEnd).order('created_at', { ascending: false });
        if (res.error) throw res.error;
        data = res.data || [];
        break;
      }
      case 'pending_commissions': {
        const res = await supabase.from('commission_entries').select('*, travel_partners(driver_name, vehicle_number, phone_number)').eq('commission_status', 'Pending').order('created_at', { ascending: false });
        if (res.error) throw res.error;
        data = res.data || [];
        break;
      }
      case 'paid_commissions': {
        const res = await supabase.from('commission_entries').select('*, travel_partners(driver_name, vehicle_number, phone_number)').eq('commission_status', 'Paid').order('paid_at', { ascending: false });
        if (res.error) throw res.error;
        data = res.data || [];
        break;
      }
      case 'active_partners': {
        const res = await supabase.from('travel_partners').select('*').eq('partner_status', 'Active Partner').eq('is_active', true).order('last_contacted_at', { ascending: false, nullsFirst: false });
        if (res.error) throw res.error;
        data = res.data || [];
        break;
      }
      case 'lead_only': {
        const res = await supabase.from('travel_partners').select('*').eq('partner_status', 'Lead Only').order('created_at', { ascending: false });
        if (res.error) throw res.error;
        data = res.data || [];
        break;
      }
      default:
        return new Response(JSON.stringify({ error: 'Unknown report type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ report: data, type }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

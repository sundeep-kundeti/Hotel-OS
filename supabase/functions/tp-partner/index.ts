import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-tp-session',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const username = validateSession(req);
  if (!username) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Extract partner id from URL: /functions/v1/tp-partner/<id>
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const id = pathParts[pathParts.length - 1];

  if (!id || id === 'tp-partner') {
    return new Response(JSON.stringify({ error: 'Partner ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    if (req.method === 'GET') {
      const { data: partner, error: partnerError } = await supabase
        .from('travel_partners')
        .select('*')
        .eq('id', id)
        .single();

      if (partnerError || !partner) {
        return new Response(JSON.stringify({ error: 'Partner not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: commissions, error: commError } = await supabase
        .from('commission_entries')
        .select('commission_amount, commission_status')
        .eq('partner_id', id);

      if (commError) throw commError;

      const totalBookings = commissions?.length || 0;
      const totalCommission = commissions?.reduce((s, r) => s + (r.commission_amount || 0), 0) || 0;
      const totalPaid = commissions?.filter((r) => r.commission_status === 'Paid').reduce((s, r) => s + (r.commission_amount || 0), 0) || 0;
      const totalPending = commissions?.filter((r) => r.commission_status === 'Pending').reduce((s, r) => s + (r.commission_amount || 0), 0) || 0;

      return new Response(
        JSON.stringify({ partner, summary: { total_bookings: totalBookings, total_commission: totalCommission, total_paid: totalPaid, total_pending: totalPending } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (req.method === 'PATCH') {
      const body = await req.json();
      const allowed = ['partner_status', 'notes', 'driver_name', 'vehicle_make', 'is_active', 'last_contacted_at'];
      const updates: Record<string, unknown> = {};
      for (const key of allowed) {
        if (key in body) updates[key] = body[key];
      }
      if (Object.keys(updates).length === 0) {
        return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: partner, error } = await supabase
        .from('travel_partners')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ partner }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function validateSession(req: Request): string | null {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
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

  // Extract partner_id from URL: /functions/v1/tp-commissions/<partner_id>
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const partnerId = pathParts[pathParts.length - 1];

  if (!partnerId || partnerId === 'tp-commissions') {
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
      const { data, error } = await supabase
        .from('commission_entries')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ commissions: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const commissionAmount = Number(body.commission_amount);

      if (!commissionAmount || commissionAmount <= 0) {
        return new Response(JSON.stringify({ error: 'commission_amount must be a positive number' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: commission, error } = await supabase
        .from('commission_entries')
        .insert({
          partner_id: partnerId,
          customer_name: body.customer_name || null,
          room_number: body.room_number || null,
          booking_amount: Number(body.booking_amount) || 0,
          commission_amount: commissionAmount,
          commission_status: body.commission_status || 'Pending',
          payment_mode: body.payment_mode || 'Pending',
          notes: body.notes || null,
          entered_by: username,
          paid_at: body.commission_status === 'Paid' ? new Date().toISOString() : null,
        })
        .select('*')
        .single();

      if (error) throw error;

      // Update last_contacted_at
      await supabase
        .from('travel_partners')
        .update({ last_contacted_at: new Date().toISOString() })
        .eq('id', partnerId);

      return new Response(JSON.stringify({ commission }), {
        status: 201,
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

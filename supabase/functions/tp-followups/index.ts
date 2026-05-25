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

  // Extract partner_id from URL: /functions/v1/tp-followups/<partner_id>
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const partnerId = pathParts[pathParts.length - 1];

  if (!partnerId || partnerId === 'tp-followups') {
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
        .from('followup_logs')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ followups: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();

      const { data: followup, error } = await supabase
        .from('followup_logs')
        .insert({
          partner_id: partnerId,
          contact_method: body.contact_method || null,
          response_status: body.response_status || null,
          next_followup_at: body.next_followup_at || null,
          notes: body.notes || null,
          entered_by: username,
        })
        .select('*')
        .single();

      if (error) throw error;

      // Update last_contacted_at and optionally partner_status
      const partnerUpdates: Record<string, string> = {
        last_contacted_at: new Date().toISOString(),
      };
      if (body.response_status) {
        partnerUpdates.partner_status = body.response_status;
      }
      await supabase.from('travel_partners').update(partnerUpdates).eq('id', partnerId);

      return new Response(JSON.stringify({ followup }), {
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

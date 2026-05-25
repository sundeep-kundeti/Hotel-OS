import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

function normalizePhone(v: string): string {
  return v.replace(/\D/g, '').slice(-10);
}
function normalizeVehicle(v: string): string {
  return v.replace(/[\s\-]/g, '').toUpperCase();
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
    const type = url.searchParams.get('type');
    const value = url.searchParams.get('value');

    if (!type || !value) {
      return new Response(JSON.stringify({ error: 'Missing type or value parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (type !== 'phone' && type !== 'vehicle') {
      return new Response(JSON.stringify({ error: 'type must be phone or vehicle' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const normalized = type === 'phone' ? normalizePhone(value.trim()) : normalizeVehicle(value.trim());
    if (!normalized) {
      return new Response(JSON.stringify({ found: false, results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const column = type === 'phone' ? 'phone_number' : 'vehicle_number';
    const { data, error } = await supabase
      .from('travel_partners')
      .select('*')
      .eq(column, normalized)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ found: data.length > 0, results: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

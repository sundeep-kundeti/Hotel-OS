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
    // Session valid for 12 hours
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
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const status = url.searchParams.get('status');
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabase
        .from('travel_partners')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) query = query.eq('partner_status', status);

      const { data, error, count } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ partners: data, total: count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const phone = normalizePhone(String(body.phone_number || ''));
      const vehicle = normalizeVehicle(String(body.vehicle_number || ''));

      if (!phone || phone.length !== 10) {
        return new Response(JSON.stringify({ error: 'Valid 10-digit phone number is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (!vehicle || vehicle.length < 8) {
        return new Response(JSON.stringify({ error: 'Valid vehicle number is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: partner, error } = await supabase
        .from('travel_partners')
        .insert({
          phone_number: phone,
          vehicle_number: vehicle,
          driver_name: body.driver_name || null,
          vehicle_make: body.vehicle_make || null,
          lead_source: body.lead_source || 'Vehicle Number Seen',
          partner_status: body.partner_status || 'Lead Only',
          notes: body.notes || null,
          created_by: username,
          is_active: true,
        })
        .select('*')
        .single();

      if (error) {
        if (error.code === '23505') {
          return new Response(
            JSON.stringify({ error: 'A partner with this phone number and vehicle number already exists.' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
        }
        throw error;
      }

      return new Response(JSON.stringify({ partner }), {
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

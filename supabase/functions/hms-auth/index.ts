import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-hms-session',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const url = new URL(req.url);
  const path = url.pathname.split('/').filter(Boolean).pop();

  // POST /hms-auth  → login
  if (req.method === 'POST' && (path === 'hms-auth' || path === 'login')) {
    try {
      const { username, password } = await req.json();
      if (!username || !password) {
        return new Response(JSON.stringify({ error: 'Username and password required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: staff, error } = await supabase
        .from('hms_staff')
        .select('id, username, name, role, is_active, password_hash')
        .eq('username', username.toLowerCase().trim())
        .single();

      if (error || !staff) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!staff.is_active) {
        return new Response(JSON.stringify({ error: 'Account is disabled' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (staff.password_hash !== password) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Build session token — same pattern as tp_session
      const sessionPayload = {
        staffId: staff.id,
        username: staff.username,
        name: staff.name,
        role: staff.role,
        loginAt: new Date().toISOString(),
      };
      const token = btoa(JSON.stringify(sessionPayload));

      // 12-hour cookie
      const expires = new Date(Date.now() + 12 * 60 * 60 * 1000).toUTCString();
      const cookie = `hms_session=${token}; Path=/; Expires=${expires}; SameSite=Lax`;

      return new Response(
        JSON.stringify({ success: true, role: staff.role, name: staff.name, token }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Set-Cookie': cookie,
          },
        },
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // GET /hms-auth  → validate session
  if (req.method === 'GET') {
    const sessionToken = req.headers.get('x-hms-session') || '';
    if (!sessionToken) {
      return new Response(JSON.stringify({ error: 'No session' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    try {
      const decoded = JSON.parse(atob(sessionToken));
      if (!decoded.username || !decoded.loginAt) throw new Error('Invalid token');
      const loginTime = new Date(decoded.loginAt).getTime();
      if (Date.now() - loginTime > 12 * 60 * 60 * 1000) {
        return new Response(JSON.stringify({ error: 'Session expired' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ valid: true, ...decoded }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

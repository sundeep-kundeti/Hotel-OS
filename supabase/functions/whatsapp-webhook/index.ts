import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'hotel_os_secret_token_123';

function parseFreshUpWhatsappMessage(text: string) {
  return {
    parsedDate: text.match(/Date:\s*(.+)/i)?.[1]?.trim() || null,
    parsedTime: text.match(/Time:\s*(.+)/i)?.[1]?.trim() || null,
    parsedDurationHours: text.match(/Duration:\s*(\d+)/i)?.[1] ? Number(text.match(/Duration:\s*(\d+)/i)![1]) : null,
    parsedPax: text.match(/Pax:\s*(\d+)/i)?.[1] ? Number(text.match(/Pax:\s*(\d+)/i)![1]) : null,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
      return new Response(challenge, { status: 200, headers: corsHeaders });
    }
    return new Response('Forbidden', { status: 403, headers: corsHeaders });
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];
      const customerName = contact?.profile?.name || 'Unknown';

      if (!message) return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      const parsedData = parseFreshUpWhatsappMessage(message.text?.body ?? '');
      await supabase.from('whatsapp_booking_leads').insert({
        wa_message_id: message.id,
        customer_mobile: message.from,
        customer_name: customerName,
        raw_message: message.text?.body ?? '',
        ...parsedData,
        booking_type: 'fresh_up',
        status: 'new',
      });

      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch {
      return new Response(JSON.stringify({ ok: true, error_caught: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
});

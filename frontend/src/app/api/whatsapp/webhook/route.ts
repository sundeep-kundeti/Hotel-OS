import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = 'edge';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'hotel_os_secret_token_123';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];
    
    // Also capture contact name if available
    const contact = value?.contacts?.[0];
    const customerName = contact?.profile?.name || 'Unknown';

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const waMessageId = message.id;
    const from = message.from;
    const text = message.text?.body ?? "";

    const parsedData = parseFreshUpWhatsappMessage(text);

    const { error } = await supabaseServer
      .from('whatsapp_booking_leads')
      .insert({
        wa_message_id: waMessageId,
        customer_mobile: from,
        customer_name: customerName,
        raw_message: text,
        parsed_date: parsedData.parsedDate,
        parsed_time: parsedData.parsedTime,
        parsed_duration_hours: parsedData.parsedDurationHours,
        parsed_pax: parsedData.parsedPax,
        booking_type: 'fresh_up',
        status: 'new'
      });

    if (error) {
      console.error('Error saving WhatsApp lead:', error);
    }

    return NextResponse.json({ ok: true });
  } catch(e) {
    console.error('Webhook processing error:', e);
    // Always return 200 to WhatsApp so it doesn't retry indefinitely unless intentional
    return NextResponse.json({ ok: true, error_caught: true });
  }
}

function parseFreshUpWhatsappMessage(text: string) {
  const date = text.match(/Date:\s*(.+)/i)?.[1]?.trim();
  const time = text.match(/Time:\s*(.+)/i)?.[1]?.trim();
  const duration = text.match(/Duration:\s*(\d+)/i)?.[1];
  const pax = text.match(/Pax:\s*(\d+)/i)?.[1];

  return {
    parsedDate: date || null,
    parsedTime: time || null,
    parsedDurationHours: duration ? Number(duration) : null,
    parsedPax: pax ? Number(pax) : null,
  };
}

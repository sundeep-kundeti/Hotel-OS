import { NextResponse } from 'next/server';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Standardize phone format (strip non-numeric, prefix country code if needed, assume +91 for now)
    let processedPhone = phone.replace(/\D/g, '');
    if (processedPhone.length === 10) {
      processedPhone = '91' + processedPhone;
    }

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10 minutes

    // 2. Upsert to Supabase Edge
    const res = await fetch(`${supabaseUrl}/rest/v1/whatsapp_otps`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        phone_number: processedPhone,
        otp,
        expires_at: expiresAt
      })
    });

    if (!res.ok) {
       console.error(await res.text());
       throw new Error('Failed to persist OTP inside Database');
    }

    console.log(`[DEV MODE] OTP for ${processedPhone} is ${otp}`);

    // 3. Dispatch to WhatsApp Graph API (Only if configured)
    const waPhoneId = process.env.WHATSAPP_PHONE_ID;
    const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const waTemplateName = process.env.WHATSAPP_TEMPLATE_NAME || 'otp_auth';

    if (waPhoneId && waToken) {
       const waUrl = `https://graph.facebook.com/v19.0/${waPhoneId}/messages`;
       const waPayload = {
         messaging_product: "whatsapp",
         to: processedPhone,
         type: "template",
         template: {
           name: waTemplateName,
           language: {
             code: "en"
           },
           components: [
             {
               type: "body",
               parameters: [
                 { type: "text", text: otp }
               ]
             },
             {
               type: "button",
               sub_type: "url",
               index: "0",
               parameters: [
                 { type: "text", text: otp }
               ]
             }
           ]
         }
       };

       const waResponse = await fetch(waUrl, {
         method: 'POST',
         headers: {
            'Authorization': `Bearer ${waToken}`,
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(waPayload)
       });

       if (!waResponse.ok) {
          const waErr = await waResponse.text();
          console.error("Facebook API Warning (OTP still generated internally):", waErr);
          // We do not throw here! If Graph API fails, the OTP is still logged in the console. 
          // Crucial for environments where Meta has temporarily banned the sandbox template.
       }
    }

    return NextResponse.json({ success: true, message: 'OTP Sent' });
  } catch (error: any) {
    console.error('Error generating OTP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

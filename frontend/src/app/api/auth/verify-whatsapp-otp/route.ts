import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    let processedPhone = phone.replace(/\D/g, '');
    if (processedPhone.length === 10) {
      processedPhone = '91' + processedPhone;
    }

    // 1. Verify OTP in DB
    const res = await fetch(`${supabaseUrl}/rest/v1/whatsapp_otps?phone_number=eq.${processedPhone}&select=otp,expires_at`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const data = await res.json();
    if (!res.ok || !data.length) {
       return NextResponse.json({ error: 'No active OTP found for this number' }, { status: 400 });
    }

    const { otp: dbOtp, expires_at } = data[0];

    if (dbOtp !== otp) {
       return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    }

    if (new Date(expires_at).getTime() < Date.now()) {
       return NextResponse.json({ error: 'OTP has expired' }, { status: 401 });
    }

    // 2. Clear the OTP now that it's consumed (security)
    await fetch(`${supabaseUrl}/rest/v1/whatsapp_otps?phone_number=eq.${processedPhone}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    // 3. Determine Role (Is this person a Manager?)
    const roleRes = await fetch(`${supabaseUrl}/rest/v1/admin_users?phone_number=eq.${processedPhone}&select=role`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const roleData = await roleRes.json();
    
    const isManager = roleData.length > 0 && roleData[0].role === 'manager';
    const finalRole = isManager ? 'manager' : 'guest';

    // 4. Generate JWT & Set Secure Cookie
    // Edge-safe JWT Generator using Sub-Key
    const encoder = new TextEncoder();
    const keyData = encoder.encode(process.env.JWT_SECRET || 'fallback_secret_hotel_os_2026');
    const cryptoKey = await crypto.subtle.importKey(
        'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );

    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadBuffer = JSON.stringify({ phone: processedPhone, role: finalRole, exp: Date.now() + 86400000 }); // 24 hours
    const payload64 = btoa(payloadBuffer).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const signatureBytes = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(`${header}.${payload64}`));
    const signature64 = btoa(String.fromCharCode(...new Uint8Array(signatureBytes))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const token = `${header}.${payload64}.${signature64}`;

    const cookieStore = await cookies();
    cookieStore.set('hotel_os_session', token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'strict',
       path: '/',
       maxAge: 86400 * 7 // 7 Days
    });

    return NextResponse.json({ success: true, role: finalRole });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

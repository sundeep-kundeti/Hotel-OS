import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, password, fullName, email, dob, anniversary, city, promotionalConsent } = body;
    
    if (!phone || !fullName || !password) {
      return NextResponse.json({ error: 'Phone, Password, and Full Name are strictly required to build the profile.' }, { status: 400 });
    }

    let processedPhone = phone.replace(/\D/g, '');
    if (processedPhone.length === 10) {
      processedPhone = '91' + processedPhone;
    }

    // Hash Password for storing
    const hashed_password = await computeHash(password);

    // 1. Insert into Supabase 'guests'
    const payload: any = {
        phone_number: processedPhone,
        password_hash: hashed_password,
        full_name: fullName,
        promotional_consent: promotionalConsent ?? true
    };
    if (email) payload.email = email;
    if (dob) payload.dob = dob;
    if (anniversary) payload.anniversary = anniversary;
    if (city) payload.city = city;

    const res = await fetch(`${supabaseUrl}/rest/v1/guests`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
        console.error(await res.text());
        return NextResponse.json({ error: 'Failure syncing Guest Profile to Database' }, { status: 500 });
    }

    // 2. Synthesize Secure Session Token for the Guest
    return await issueSecureToken(processedPhone, 'guest');

  } catch (error: any) {
    console.error('Registration parsing crash:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function issueSecureToken(phone: string, role: string) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(process.env.JWT_SECRET || 'fallback_secret_hotel_os_2026');
    const cryptoKey = await globalThis.crypto.subtle.importKey(
        'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );

    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadBuffer = JSON.stringify({ phone, role, exp: Date.now() + 86400000 }); // 24 hours
    const payload64 = btoa(payloadBuffer).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const signatureBytes = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(`${header}.${payload64}`));
    const signature64 = btoa(String.fromCharCode(...new Uint8Array(signatureBytes))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const token = `${header}.${payload64}.${signature64}`;

    const cookieStore = await cookies();
    cookieStore.set('hotel_os_session', token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'strict',
       path: '/',
       maxAge: 60 * 10 // 10 Minutes
    });

    return NextResponse.json({ success: true, status: 'authenticated', role });
}

async function computeHash(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + (process.env.JWT_SECRET || 'hotel_crypto_salt_123'));
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

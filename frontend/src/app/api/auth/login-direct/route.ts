import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and Password are required' }, { status: 400 });
    }

    let processedPhone = phone.replace(/\D/g, '');
    if (processedPhone.length === 10) {
      processedPhone = '91' + processedPhone;
    }

    // Hash the inbound password
    const hashedAttempt = await computeHash(password);

    // 1. Check Manager Role
    const roleRes = await fetch(`${supabaseUrl}/rest/v1/admin_users?phone_number=eq.${processedPhone}&select=role,password_hash`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const roleData = await roleRes.json();
    
    if (roleData && roleData.length > 0) {
        if (roleData[0].password_hash && roleData[0].password_hash !== hashedAttempt) {
            return NextResponse.json({ error: 'Incorrect Database Password' }, { status: 401 });
        }
        return await issueSecureToken(processedPhone, 'manager');
    }

    // 2. Check Guest Role
    const guestRes = await fetch(`${supabaseUrl}/rest/v1/guests?phone_number=eq.${processedPhone}&select=id,password_hash`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
    });

    const guestData = await guestRes.json();
    if (guestData && guestData.length > 0) {
        if (guestData[0].password_hash && guestData[0].password_hash !== hashedAttempt) {
            return NextResponse.json({ error: 'Incorrect Database Password' }, { status: 401 });
        }
        return await issueSecureToken(processedPhone, 'guest');
    }

    // 3. User Not Found -> Forward to Signup Profile Flow
    return NextResponse.json({ success: true, status: 'new_user' });

  } catch (error: any) {
    console.error('Error in login-direct:', error);
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
       maxAge: 86400 * 7 // 7 Days
    });

}

async function computeHash(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + (process.env.JWT_SECRET || 'hotel_crypto_salt_123'));
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

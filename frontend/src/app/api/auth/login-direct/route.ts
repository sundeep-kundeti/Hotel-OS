import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseUrl, supabaseKey } from '@/lib/db';
import * as crypto from 'crypto';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    let processedPhone = phone.replace(/\D/g, '');
    if (processedPhone.length === 10) {
      processedPhone = '91' + processedPhone;
    }

    // 1. Check Manager Role
    const roleRes = await fetch(`${supabaseUrl}/rest/v1/admin_users?phone_number=eq.${processedPhone}&select=role`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const roleData = await roleRes.json();
    
    const isManager = roleData.length > 0 && roleData[0].role === 'manager';

    if (isManager) {
        return await issueSecureToken(processedPhone, 'manager');
    }

    // 2. Check Guest Role
    const guestRes = await fetch(`${supabaseUrl}/rest/v1/guests?phone_number=eq.${processedPhone}&select=id`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
    });

    const guestData = await guestRes.json();
    if (guestData && guestData.length > 0) {
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

    return NextResponse.json({ success: true, status: 'authenticated', role });
}

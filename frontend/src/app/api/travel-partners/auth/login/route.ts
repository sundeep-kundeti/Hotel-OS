import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Staff accounts stored as env var: TP_AUTH_USERS={"manager":"Srimuni@2026","frontdesk1":"Front@2026","frontdesk2":"Front@2026"}
function getStaffAccounts(): Record<string, string> {
  try {
    const raw = process.env.TP_AUTH_USERS;
    if (raw) return JSON.parse(raw);
  } catch {}
  // Fallback defaults
  return {
    manager: 'Srimuni@2026',
    frontdesk1: 'Front@2026',
    frontdesk2: 'Front@2026',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    if (!username || !password) {
      return NextResponse.json({ error: 'Invalid credentials format' }, { status: 400 });
    }
    const accounts = getStaffAccounts();

    if (!accounts[username] || accounts[username] !== password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const sessionPayload = btoa(
      JSON.stringify({ username, loginAt: new Date().toISOString() })
    );

    const response = NextResponse.json({ success: true, username });
    response.cookies.set('tp_session', sessionPayload, {
      // NOT httpOnly — the client must read this cookie via document.cookie
      // to build the Authorization: Bearer header for direct Supabase edge function calls.
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

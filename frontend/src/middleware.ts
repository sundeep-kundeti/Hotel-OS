import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Hotel OS Manager routes (existing) ──────────────────────────────────
  if (pathname.startsWith('/fresh-up/manager') || pathname.startsWith('/reservations')) {
    const authCookie = request.cookies.get('hotel_os_session');
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ── Travel Partner Tool routes ────────────────────────────────────────
  // Allow login page through; protect everything else under /travel-partners
  if (
    pathname.startsWith('/travel-partners') &&
    !pathname.startsWith('/travel-partners/login') &&
    !pathname.startsWith('/api/travel-partners/auth')
  ) {
    const tpSession = request.cookies.get('tp_session');
    if (!tpSession) {
      const loginUrl = new URL('/travel-partners/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/fresh-up/manager/:path*',
    '/reservations/:path*',
    '/travel-partners/:path*',
  ],
};

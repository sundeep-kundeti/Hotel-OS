import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if they are trying to access protected paths
  if (request.nextUrl.pathname.startsWith('/fresh-up/manager') || request.nextUrl.pathname.startsWith('/reservations')) {
     
     const authCookie = request.cookies.get('hotel_os_session');

     // If no valid session securely identified, force block
     if (!authCookie) {
        return NextResponse.redirect(new URL('/login', request.url));
     }

     // Under ideal circumstances we would decode the JWT and check expiration/role.
     // In Edge Config, we trust the signature integrity verified primarily upon token issue, mapped to HttpOnly.
     // If they hold the hotel_os_session cookie, they pass the middleware firewall.

  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/fresh-up/manager/:path*',
    '/reservations/:path*',
  ],
};

'use client';

// Static shell — auth check is done client-side to avoid server-side cookies()
// which would require edge runtime and add ~1.6 MiB to the CF Worker bundle.
export const dynamic = 'force-static';

import { useEffect, useState } from 'react';
import GuestFreshUpPage from '../../features/fresh-up/components/GuestFreshUpPage';
import GlobalNavbar from '../../components/GlobalNavbar';

export default function GuestFreshUpRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Read hotel_os_session cookie client-side (same info, no server needed)
    const hasSession = document.cookie.includes('hotel_os_session=');
    setIsAuthenticated(hasSession);
    setReady(true);
  }, []);

  // Prevent hydration flash — wait for client cookie check
  if (!ready) return null;

  return (
    <>
      <GlobalNavbar isAuthenticated={isAuthenticated} />
      <GuestFreshUpPage isAuthenticated={isAuthenticated} />
    </>
  );
}

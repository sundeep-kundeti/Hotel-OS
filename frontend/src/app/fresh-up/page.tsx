import GuestFreshUpPage from '../../features/fresh-up/components/GuestFreshUpPage';
import { cookies } from 'next/headers';
import GlobalNavbar from '../../components/GlobalNavbar';

export default async function GuestFreshUpRoute() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('hotel_os_session');
  const isAuthenticated = !!sessionToken;

  return (
    <>
      <GlobalNavbar isAuthenticated={isAuthenticated} />
      <GuestFreshUpPage />
    </>
  );
}

import { getReservations } from '../actions/reservation.actions';
import ReservationClient from './ReservationClient';

export default async function Page() {
  const initialReservations = await getReservations();
  return <ReservationClient initialReservations={initialReservations} />;
}

'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '../../lib/db';

export async function getReservations() {
  try {
    const { data: rows, error } = await supabase
      .from('reservations')
      .select('id, roomNumber:room_number, guestName:guest_name, rate, amountPaid:amount_paid, paymentMethod:payment_method, reservationSource:reservation_source, brokerId:broker_id, checkIn:check_in, checkOut:check_out, remarks, status')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return rows;
  } catch (error: any) {
    console.warn("Database connection issue. Returning fallback data.", error.message);
    return null;
  }
}

export async function createReservation(data: any) {
  try {
    const { roomNumber, guestName, rate, amountPaid, paymentMethod, reservationSource, brokerId, checkIn, checkOut, remarks, status } = data;
    const { error } = await supabase.from('reservations').insert({
      room_number: roomNumber,
      guest_name: guestName,
      rate,
      amount_paid: amountPaid,
      payment_method: paymentMethod,
      reservation_source: reservationSource,
      broker_id: brokerId || null,
      check_in: checkIn,
      check_out: checkOut,
      remarks: remarks || null,
      status
    });

    if (error) throw error;
    revalidatePath('/reservations');
  } catch (error: any) {
    console.error("Failed to insert reservation:", error.message);
  }
}

export async function markCheckedOutAction(id: string) {
  try {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'checked_out' })
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/reservations');
  } catch (error: any) {
    console.error("Failed to mark checkout:", error.message);
  }
}

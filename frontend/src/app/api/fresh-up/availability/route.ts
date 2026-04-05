import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer';
import { addHoursToTime, addMinutesToTime, checkTimeOverlap } from '../../../../features/fresh-up/services/freshUp.time';
import { FreshUpDurationHours, FreshUpRoomAvailability } from '../../../../features/fresh-up/types/freshUp.types';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');
  const startTime = searchParams.get('startTime');
  const duration = searchParams.get('durationHours');
  const pax = searchParams.get('paxCount');
  
  if (!date || !startTime || !duration) {
    return NextResponse.json({ error: 'Missing required search parameters' }, { status: 400 });
  }

  const durationHours = parseInt(duration, 10) as FreshUpDurationHours;

  const bookingEndTime = addHoursToTime(startTime, durationHours);
  const cleaningEndTime = addMinutesToTime(bookingEndTime, 30);

  try {
    const { data: rooms, error: roomsError } = await supabaseServer
      .from('fresh_up_rooms')
      .select('*')
      .eq('is_primary', true)
      .order('room_number', { ascending: true });

    if (roomsError) throw roomsError;

    const { data: bookings, error: bookingsError } = await supabaseServer
      .from('fresh_up_bookings')
      .select('room_number, booking_date, start_time, cleaning_end_time')
      .eq('booking_date', date)
      .in('status', ['confirmed', 'checked_in', 'cleaning']);

    if (bookingsError) throw bookingsError;

    const availableRooms: FreshUpRoomAvailability[] = rooms.map((room) => {
      const roomBookings = bookings.filter(b => b.room_number === room.room_number);
      
      let isAvailableForSlot = true;
      let nextAvailableTime = undefined;

      for (const b of roomBookings) {
        const overlaps = checkTimeOverlap(
          startTime, 
          cleaningEndTime, 
          b.start_time, 
          b.cleaning_end_time
        );

        if (overlaps) {
          isAvailableForSlot = false;
          nextAvailableTime = b.cleaning_end_time.slice(0, 5);
        }
      }

      return {
        roomNumber: room.room_number,
        floor: room.floor,
        isPrimary: room.is_primary,
        status: isAvailableForSlot ? 'available' : 'booked',
        matchedSlotAvailable: isAvailableForSlot,
        matchedSlotReason: isAvailableForSlot ? undefined : 'Room is pre-booked for this timeslot.',
        nextAvailableTime: nextAvailableTime
      };
    });

    return NextResponse.json({
       availableRooms
    });
  } catch (error: any) {
    console.error('Availability Engine Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

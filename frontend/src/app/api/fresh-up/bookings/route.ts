import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer';
import { FreshUpBookingCreateRequest } from '../../../../features/fresh-up/types/freshUp.types';
import { getLocalISTDate, getLocalISTTime, addHoursToTime, addMinutesToTime, checkTimeOverlap } from '../../../../features/fresh-up/services/freshUp.time';
import { customerDetailsSchema } from '../../../../features/fresh-up/schemas/freshUp.schemas';

export const runtime = 'edge';

function generateBookingCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const prefix = letters[Math.floor(Math.random() * 24)] + letters[Math.floor(Math.random() * 24)];
  const num = Math.floor(100000 + Math.random() * 900000);
  return `FUR-${prefix}${num}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: FreshUpBookingCreateRequest = await request.json();

    if (!body.roomNumber || !body.bookingDate || !body.startTime || !body.customer) {
       return NextResponse.json({ error: 'Missing required payload keys.' }, { status: 400 });
    }
    
    const today = getLocalISTDate();
    const now = getLocalISTTime();
    
    // Safety buffer for Edge Transit (2 minutes grace vs clock)
    const [h, m] = now.split(':').map(Number);
    const graceMin = h * 60 + m - 2; 
    const graceTime = `${Math.floor(graceMin / 60).toString().padStart(2, '0')}:${(graceMin % 60).toString().padStart(2, '0')}`;
    
    if (body.bookingDate < today || (body.bookingDate === today && body.startTime < graceTime)) {
       return NextResponse.json({ error: 'System Time Check Failed: Cannot secure bookings for elapsed local timeframes.' }, { status: 403 });
    }

    const validation = customerDetailsSchema.safeParse(body.customer);
    if (!validation.success) {
       return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 });
    }

    const endTime = addHoursToTime(body.startTime, body.durationHours);
    const cleaningEndTime = addMinutesToTime(endTime, 30);
    
    // Same guest same hour deduplication
    const { data: guestBookings, error: guestBookingsError } = await supabaseServer
      .from('fresh_up_bookings')
      .select('start_time, room_number')
      .eq('booking_date', body.bookingDate)
      .or(`mobile_number.eq.${body.customer.mobileNumber},aadhaar_number.eq.${body.customer.aadhaarNumber}`)
      .in('status', ['confirmed', 'checked_in', 'cleaning']);

    if (guestBookingsError) throw guestBookingsError;

    if (guestBookings && guestBookings.length > 0) {
       const newStartMins = parseInt(body.startTime.split(':')[0]) * 60 + parseInt(body.startTime.split(':')[1]);
       
       for (const existing of guestBookings) {
          const existingStartMins = parseInt(existing.start_time.split(':')[0]) * 60 + parseInt(existing.start_time.split(':')[1]);
          if (Math.abs(newStartMins - existingStartMins) < 60) {
              return NextResponse.json({ error: `Verification Failed: A room (${existing.room_number}) is already secured under your identity for this timeframe. Multiple concurrent room bookings per guest are strictly prohibited.` }, { status: 409 });
          }
       }
    }
    
    const { data: conflicts, error: conflictError } = await supabaseServer
      .from('fresh_up_bookings')
      .select('booking_date, start_time, cleaning_end_time')
      .eq('room_number', body.roomNumber)
      .eq('booking_date', body.bookingDate)
      .in('status', ['confirmed', 'checked_in', 'cleaning']);

    if (conflictError) throw conflictError;

    const hasOverlap = conflicts.some(c => checkTimeOverlap(
      body.startTime, 
      cleaningEndTime, 
      c.start_time, 
      c.cleaning_end_time
    ));
    
    if (hasOverlap) {
       return NextResponse.json({ error: 'Conflict: This timeframe was just secured by another guest.' }, { status: 409 });
    }

    const bookingCode = generateBookingCode();
    
    const insertPayload = {
       booking_code: bookingCode,
       room_number: body.roomNumber,
       guest_name: body.customer.fullName,
       mobile_number: body.customer.mobileNumber,
       alternate_mobile_number: body.customer.alternateMobileNumber || null,
       gender: body.customer.gender,
       pax_count: body.customer.paxCount,
       aadhaar_name: body.customer.aadhaarName,
       aadhaar_number: body.customer.aadhaarNumber,
       aadhaar_district: body.customer.aadhaarDistrict,
       aadhaar_state: body.customer.aadhaarState,
       declaration_outside_tirupati: body.customer.declarationOutsideTirupati,
       declaration_aadhaar_verification_accepted: body.customer.declarationAadhaarVerificationAccepted,
       declaration_pay_at_hotel_accepted: body.customer.declarationPayAtHotelAccepted,
       booking_date: body.bookingDate,
       start_time: body.startTime,
       end_time: endTime,
       cleaning_end_time: cleaningEndTime,
       duration_hours: body.durationHours,
       amount: body.amount,
       payment_mode: 'pay_at_hotel',
       payment_status: 'pending',
       status: 'confirmed',
       verification_status: 'pending'
    };

    const { data, error: insertError } = await supabaseServer
       .from('fresh_up_bookings')
       .insert(insertPayload)
       .select('id')
       .single();

    if (insertError) throw insertError;

    return NextResponse.json({
       bookingId: data.id,
       bookingCode,
       status: 'confirmed',
       roomNumber: body.roomNumber,
       bookingDate: body.bookingDate,
       startTime: body.startTime,
       endTime,
       cleaningEndTime,
       amount: body.amount,
       paymentMode: 'pay_at_hotel'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Booking Creation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader } from './PageHeader';
import { BookingControlBar } from './BookingControlBar';
import { RoomAvailabilityPanel } from './RoomAvailabilityPanel';
import { BookingSummaryCard } from './BookingSummaryCard';
import { CustomerDetailsForm } from './CustomerDetailsForm';
import { SubmitBookingButton } from './SubmitBookingButton';
import { FreshUpBookingSuccessCard } from './FreshUpBookingSuccessCard';
import { FreshUpRoomAvailability } from '../types/freshUp.types';
import { useFreshUpBookingForm } from '../hooks/useFreshUpBookingForm';
import { getLocalISTDate, getLocalISTTime } from '../services/freshUp.time';
import { calculateFreshUpPrice } from '../services/freshUp.pricing';
export interface FreshUpBookingPageProps {
  initialDate?: string;
}

export default function FreshUpBookingPage({ initialDate }: FreshUpBookingPageProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate || getLocalISTDate());
  const [selectedPax, setSelectedPax] = useState<1 | 2>(1);
  const [selectedDuration, setSelectedDuration] = useState<1 | 2 | 3>(1);
  
  const [selectedStartTime, setSelectedStartTime] = useState(() => {
    return getLocalISTTime();
  });
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [rooms, setRooms] = useState<FreshUpRoomAvailability[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const { values, errors, updateField, validate } = useFreshUpBookingForm(selectedPax);

  useEffect(() => {
    const fetchRooms = async () => {
      setAvailabilityLoading(true);
      setSelectedRoomNumber(undefined); // Enforce re-selection natively on criteria shift
      try {
        const res = await fetch(`/api/fresh-up/availability?date=${selectedDate}&startTime=${selectedStartTime}&durationHours=${selectedDuration}&paxCount=${selectedPax}`);
        const data = await res.json();
        setRooms(data.availableRooms || []);
      } catch (err) {
        console.error('REST API Sync Failure:', err);
      } finally {
        setAvailabilityLoading(false);
      }
    };
    fetchRooms();
  }, [selectedDate, selectedStartTime, selectedDuration, selectedPax]);

  const amount = calculateFreshUpPrice(selectedPax, selectedDuration);

  const handleSubmit = async () => {
    if (!selectedRoomNumber) {
      alert("Please select a room first!");
      return;
    }
    
    const today = getLocalISTDate();
    const now = getLocalISTTime();
    
    // Safety buffer for rapid local clicks (allow 2 minutes of grace vs clock)
    const [h, m] = now.split(':').map(Number);
    const graceMin = h * 60 + m - 2; 
    const graceTime = `${Math.floor(graceMin / 60).toString().padStart(2, '0')}:${(graceMin % 60).toString().padStart(2, '0')}`;
    
    if (selectedDate < today || (selectedDate === today && selectedStartTime < graceTime)) {
      alert("Check-in time cannot be in the past! Please refresh your timeline parameters.");
      return;
    }
    
    values.aadhaarName = values.fullName;

    if (!validate()) {
      document.getElementById('customer-form')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = {
        roomNumber: selectedRoomNumber,
        bookingDate: selectedDate,
        startTime: selectedStartTime,
        durationHours: selectedDuration,
        paxCount: selectedPax,
        amount,
        customer: values
      };

      const res = await fetch('/api/fresh-up/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit booking trace');

      setBookingSuccess({
        bookingCode: data.bookingCode,
        roomNumber: data.roomNumber,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
        amount: data.amount
      });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans flex items-center justify-center">
        <FreshUpBookingSuccessCard {...bookingSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-32">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Column: UI Form Elements */}
        <div className="flex-1 space-y-8">
          <PageHeader />
          <BookingControlBar
            selectedDate={selectedDate} selectedPax={selectedPax}
            selectedDuration={selectedDuration} selectedStartTime={selectedStartTime}
            onDateChange={setSelectedDate} onPaxChange={(p) => { setSelectedPax(p); updateField('paxCount', p); }}
            onDurationChange={setSelectedDuration} onStartTimeChange={setSelectedStartTime}
            disabled={loading}
          />
          <RoomAvailabilityPanel
            rooms={rooms} selectedRoomNumber={selectedRoomNumber}
            onSelectRoom={setSelectedRoomNumber} loading={availabilityLoading}
          />
          
          <div className="pt-8 border-t border-slate-200 mt-12 transition-all duration-500 opacity-100" id="customer-form">
            <CustomerDetailsForm values={values} errors={errors} onChange={(field, value) => updateField(field as any, value)} disabled={loading || !selectedRoomNumber} />
            <SubmitBookingButton loading={loading} disabled={!selectedRoomNumber} onClick={handleSubmit} />
          </div>
        </div>
        
        {/* Right Column: Sticky Summary Card */}
        <div className="lg:w-[400px] flex-shrink-0 order-first lg:order-last">
          <div className="sticky top-8">
            <BookingSummaryCard
              roomNumber={selectedRoomNumber} bookingDate={selectedDate}
              startTime={selectedStartTime} paxCount={selectedPax}
              durationHours={selectedDuration} amount={amount}
              paymentMode="pay_at_hotel"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { SummaryCardsRow } from './SummaryCardsRow';
import { FilterBar } from './FilterBar';
import { LiveScheduleBoard } from './LiveScheduleBoard';
import { BookingTable } from './BookingTable';
import { BookingDetailDrawer } from './BookingDetailDrawer';
import { FreshUpDashboardSummary, ManagerRoomScheduleCardData, ManagerBookingTableRow } from '../../types/freshUp.types';

export default function ManagerFreshUpDashboard({ initialDate }: { initialDate?: string }) {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().slice(0, 10));
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  // Use hook mock for Sprint 3
  const mockSummary: FreshUpDashboardSummary = {
     totalBookingsToday: 12,
     activeOccupiedRooms: 4,
     cleaningRooms: 1,
     availablePrimaryRooms: 15,
     pendingVerification: 2,
     expectedCollectionToday: 4800
  };

  const mockRooms: ManagerRoomScheduleCardData[] = [
    { roomNumber: '501', floor: 5, currentStatus: 'available' },
    { roomNumber: '502', floor: 5, currentStatus: 'occupied', currentGuestName: 'Rajesh Kumar', currentBookingEnd: '14:30' },
    { roomNumber: '503', floor: 5, currentStatus: 'cleaning', currentBookingEnd: '12:00', nextAvailableTime: '12:15' },
    { roomNumber: '504', floor: 5, currentStatus: 'reserved', currentGuestName: 'Anil Reddy', currentBookingEnd: '16:00' },
  ];

  const [mockBookings, setMockBookings] = useState<ManagerBookingTableRow[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    const fetchManagerBookings = async () => {
      setLoadingBookings(true);
      try {
        const res = await fetch(`/api/fresh-up/manager/bookings?date=${selectedDate}`);
        const data = await res.json();
        
        if (res.ok && data.bookings) {
           // We are mapping the DB snake_case payload into the frontend camelCase Type dynamically.
           const mapped: ManagerBookingTableRow[] = data.bookings.map((b: any) => ({
             bookingId: b.id,
             bookingCode: b.booking_code,
             roomNumber: b.room_number,
             guestName: b.guest_name,
             mobileNumber: b.mobile_number,
             paxCount: b.pax_count,
             bookingDate: b.booking_date,
             startTime: b.start_time,
             endTime: b.end_time,
             cleaningEndTime: b.cleaning_end_time,
             amount: b.amount,
             paymentStatus: b.payment_status,
             verificationStatus: b.verification_status,
             status: b.status,
             remarks: b.manager_remarks
           }));
           setMockBookings(mapped);
        }
      } catch (err) {
        console.error('Failed to sync bookings:', err);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchManagerBookings();
  }, [selectedDate]);

  const activeBooking = mockBookings.find(b => b.bookingId === activeBookingId);

  const handleManagerAction = async (action: string) => {
    if (!activeBooking) return;
    
    // Quick mock payload for the API based on action
    const payload: any = {};
    if (action === 'cancel') {
      const reason = window.prompt("Reason for manual cancellation:");
      if (!reason) return;
      payload.reason = reason;
    }
    if (action === 'reassign') {
      const room = window.prompt("Which exact room number to force assign?");
      if (!room) return;
      payload.roomNumber = room;
      payload.reason = 'Manual Override';
    }

    try {
      const res = await fetch('/api/fresh-up/manager/actions', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ bookingId: activeBooking.bookingId, action, payload })
      });
      if (!res.ok) throw new Error('API Sync Failed.');
      
      // Force refresh data
      window.location.reload();
    } catch(e) {
      alert('Network transmission failed: ' + e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-24">
      <div className="max-w-[1400px] mx-auto">
        <DashboardHeader />
        
        <SummaryCardsRow summary={mockSummary} loading={false} />
        
        <FilterBar 
           selectedDate={selectedDate} searchText={searchText} selectedStatus={selectedStatus}
           onDateChange={setSelectedDate} onSearchChange={setSearchText} onStatusChange={setSelectedStatus} onRoomChange={() => {}}
        />
        
        <LiveScheduleBoard roomSchedules={mockRooms} onViewBooking={setActiveBookingId} onQuickAction={() => {}} />
        
        <h2 className="text-xl font-extrabold text-slate-800 mb-6 border-b border-slate-200 pb-4">Recent Reservations</h2>
        <BookingTable rows={mockBookings} onViewBooking={setActiveBookingId} loading={loadingBookings} />
      </div>

      <BookingDetailDrawer 
        isOpen={!!activeBookingId} 
        booking={activeBooking} 
        onClose={() => setActiveBookingId(null)} 
        onAction={handleManagerAction}
      />
    </div>
  );
}

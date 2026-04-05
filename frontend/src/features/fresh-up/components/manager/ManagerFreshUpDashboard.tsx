'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { SummaryCardsRow } from './SummaryCardsRow';
import { FilterBar } from './FilterBar';
import { LiveScheduleBoard } from './LiveScheduleBoard';
import { BookingTable } from './BookingTable';
import { BookingDetailDrawer } from './BookingDetailDrawer';
import { FreshUpDashboardSummary, ManagerRoomScheduleCardData, ManagerBookingTableRow, FreshUpRoomStatus } from '../../types/freshUp.types';
import { FRESH_UP_PRIMARY_ROOMS } from '../../constants/freshUp.constants';
import { getLocalISTTime } from '../../services/freshUp.time';

export default function ManagerFreshUpDashboard({ initialDate }: { initialDate?: string }) {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().slice(0, 10));
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [bookingTab, setBookingTab] = useState<'upcoming' | 'occupied' | 'departed'>('upcoming');

  // Use hook mock for Sprint 3
  const mockSummary: FreshUpDashboardSummary = {
     totalBookingsToday: 12,
     activeOccupiedRooms: 4,
     cleaningRooms: 1,
     availablePrimaryRooms: 15,
     pendingVerification: 2,
     expectedCollectionToday: 4800
  };

  const [liveRooms, setLiveRooms] = useState<ManagerRoomScheduleCardData[]>([]);

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

  useEffect(() => {
    const nowHHMM = getLocalISTTime();
    
    const computed: ManagerRoomScheduleCardData[] = FRESH_UP_PRIMARY_ROOMS.map((roomNum) => {
      const floor = roomNum.startsWith('5') ? 5 : 6;
      const todaysBookings = mockBookings.filter((b) => b.roomNumber === roomNum && b.status !== 'cancelled' && b.status !== 'rejected');
      
      let currentStatus: FreshUpRoomStatus | 'reserved' = 'available';
      let currentGuestName: string | undefined;
      let currentBookingEnd: string | undefined;
      let nextAvailableTime: string | undefined;

      const activeBooking = todaysBookings.find((b) => 
         b.status === 'checked_in' || 
         ((b.status === 'confirmed' || b.status === 'pending_confirmation') && nowHHMM >= b.startTime && nowHHMM <= b.endTime)
      );
      
      const cleaningBooking = todaysBookings.find((b) => 
         b.status === 'cleaning'
      );

      const upcoming = todaysBookings
         .filter((b) => b.startTime > nowHHMM)
         .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

      if (activeBooking) {
         currentStatus = 'occupied';
         currentGuestName = activeBooking.guestName;
         currentBookingEnd = activeBooking.endTime;
      } else if (cleaningBooking) {
         currentStatus = 'cleaning';
         currentBookingEnd = cleaningBooking.cleaningEndTime;
         nextAvailableTime = cleaningBooking.cleaningEndTime;
      }

      return {
         roomNumber: roomNum,
         floor,
         currentStatus,
         currentGuestName,
         currentBookingEnd,
         nextAvailableTime: nextAvailableTime || (upcoming ? upcoming.startTime : undefined),
         todaysBookings
      };
    });
    setLiveRooms(computed);
  }, [mockBookings]);

  const filteredBookings = useMemo(() => {
     if (bookingTab === 'upcoming') {
        return mockBookings.filter(b => b.status === 'pending_confirmation' || b.status === 'confirmed');
     }
     if (bookingTab === 'occupied') {
        return mockBookings.filter(b => b.status === 'checked_in');
     }
     if (bookingTab === 'departed') {
        return mockBookings.filter(b => b.status === 'cleaning' || b.status === 'completed' || b.status === 'checked_out');
     }
     return mockBookings;
  }, [mockBookings, bookingTab]);

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
      const room = window.prompt("Which exact room number (e.g. 506) to force assign?");
      if (!room) return;
      
      const reason = window.prompt("Reason for override (e.g. Broken AC)?");
      if (!reason) return;
      
      payload.roomNumber = room;
      payload.reason = reason;
    }
    if (action === 'check_out' || action === 'completed') {
      const hname = window.prompt(`Please specify the Housekeeper Name for ensuring Room ${activeBooking.roomNumber} is correctly processed:`);
      if (!hname) return;
      payload.housekeeperName = hname;
    }

    try {
      const res = await fetch('/api/fresh-up/manager/actions', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ bookingId: activeBooking.bookingId, action, payload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API Sync Failed.');
      
      // Force refresh data
      window.location.reload();
    } catch(e: any) {
      alert('Operation Blocked: ' + e.message);
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
        
        <LiveScheduleBoard roomSchedules={liveRooms} onViewBooking={setActiveBookingId} onQuickAction={() => {}} />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b border-slate-200 pb-4 gap-4 mt-8">
          <h2 className="text-xl font-extrabold text-slate-800">Reservation Folders</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner w-full md:w-auto">
            <button 
              onClick={() => setBookingTab('upcoming')}
              className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${bookingTab === 'upcoming' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setBookingTab('occupied')}
              className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${bookingTab === 'occupied' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Occupied
            </button>
            <button 
              onClick={() => setBookingTab('departed')}
              className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${bookingTab === 'departed' ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Departed
            </button>
          </div>
        </div>
        <BookingTable rows={filteredBookings} onViewBooking={setActiveBookingId} loading={loadingBookings} />
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

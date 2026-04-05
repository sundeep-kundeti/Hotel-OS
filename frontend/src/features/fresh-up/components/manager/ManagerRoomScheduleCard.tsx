import React from 'react';
import { ManagerRoomScheduleCardData } from '../../types/freshUp.types';

export const ManagerRoomScheduleCard: React.FC<ManagerRoomScheduleCardData> = ({
  roomNumber, currentStatus, currentGuestName, nextAvailableTime, currentBookingEnd
}) => {
  const getStatusStyle = () => {
    switch (currentStatus) {
      case 'available': return 'bg-emerald-50 border-emerald-100 text-emerald-800 shadow-emerald-100/30';
      case 'occupied': return 'bg-indigo-50 border-indigo-200 text-indigo-800 ring-1 ring-indigo-500/20 shadow-indigo-100/50';
      case 'cleaning': return 'bg-amber-50 border-amber-200 text-amber-800 ring-1 ring-amber-500/20 shadow-amber-100/50';
      case 'reserved': return 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100/30';
      default: return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm transition-all hover:scale-[1.02] cursor-default ${getStatusStyle()}`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-bold">{roomNumber}</span>
        <span className="text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-1.5 bg-white/70 rounded-lg shadow-sm border border-black/5">
          {currentStatus}
        </span>
      </div>
      
      <div className="h-16 flex flex-col justify-end">
        {currentGuestName ? (
           <p className="text-sm font-bold truncate">👤 {currentGuestName}</p>
        ) : (
           <p className="text-sm font-medium opacity-60">Ready for booking</p>
        )}
        
        {currentBookingEnd && (
           <p className="text-xs opacity-70 mt-1 font-medium">Occupied until {currentBookingEnd}</p>
        )}
        
        {nextAvailableTime && currentStatus !== 'available' && (
          <p className="text-[10px] uppercase font-bold tracking-wider opacity-70 mt-2">Next Slot: {nextAvailableTime}</p>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { ManagerRoomScheduleCardData } from '../../types/freshUp.types';

export const ManagerRoomScheduleCard: React.FC<ManagerRoomScheduleCardData> = ({
  roomNumber, currentStatus, currentGuestName, nextAvailableTime, currentBookingEnd, todaysBookings
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

      {todaysBookings && todaysBookings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200/50">
          <div className="flex justify-between text-[8px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 opacity-70">
             <span>00:00</span>
             <span>12:00</span>
             <span>23:59</span>
          </div>
          <div className="relative h-2 w-full bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
             {todaysBookings.filter((b: any) => b.status !== 'cancelled' && b.status !== 'rejected').map((b: any) => {
                const [sh, sm] = b.startTime.split(':').map(Number);
                const startPercentage = ((sh * 60 + sm) / 1440) * 100;
                
                const [eh, em] = b.endTime.split(':').map(Number);
                const endPercentage = ((eh * 60 + em) / 1440) * 100;

                const [ch, cm] = b.cleaningEndTime.split(':').map(Number);
                const cleaningPercentage = ((ch * 60 + cm) / 1440) * 100;

                const activeWidth = Math.max(endPercentage - startPercentage, 0.5);
                const cleaningWidth = Math.max(cleaningPercentage - endPercentage, 0.5);

                const getBlockColor = () => {
                   if (b.status === 'checked_out' || b.status === 'completed') return 'bg-slate-400';
                   if (b.status === 'checked_in') return 'bg-indigo-500';
                   return 'bg-blue-400 opacity-80'; // confirmed
                };

                return (
                  <React.Fragment key={b.bookingId}>
                    {/* Occupied Block */}
                    <div 
                      className={`absolute top-0 bottom-0 ${getBlockColor()}`} 
                      style={{ left: `${startPercentage}%`, width: `${activeWidth}%` }} 
                      title={`${b.guestName}: ${b.startTime} - ${b.endTime}`} 
                    />
                    {/* Cleaning Buffer Block */}
                    <div 
                      className="absolute top-0 bottom-0 bg-amber-400 opacity-90" 
                      style={{ left: `${endPercentage}%`, width: `${cleaningWidth}%` }} 
                      title={`Cleaning: ${b.endTime} - ${b.cleaningEndTime}`} 
                    />
                  </React.Fragment>
                );
             })}
          </div>
        </div>
      )}
    </div>
  );
};

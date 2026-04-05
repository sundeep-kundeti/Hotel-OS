import React, { useState, useMemo, useEffect } from 'react';
import { ManagerRoomScheduleCardData } from '../../types/freshUp.types';
import { ManagerRoomScheduleCard } from './ManagerRoomScheduleCard';

export interface LiveScheduleBoardProps {
  roomSchedules: ManagerRoomScheduleCardData[];
  onViewBooking: (bookingId: string) => void;
  onQuickAction: (action: any) => void;
}

export const LiveScheduleBoard: React.FC<LiveScheduleBoardProps> = ({ roomSchedules }) => {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  const floors = useMemo(() => Array.from(new Set(roomSchedules.map(r => r.floor))).sort(), [roomSchedules]);
  
  useEffect(() => {
    if (floors.length > 0 && selectedFloor === null) {
      setSelectedFloor(floors[0]);
    }
  }, [floors, selectedFloor]);

  const displayedRooms = useMemo(() => {
     if (selectedFloor === null) return [];
     return roomSchedules.filter(r => r.floor === selectedFloor);
  }, [roomSchedules, selectedFloor]);

  return (
    <div className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-slate-200 pb-4">
        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"></path></svg>
          Live Room Inventory
        </h2>
        
        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto scrollbar-none">
          {floors.map(floor => (
             <button
               key={floor}
               onClick={() => setSelectedFloor(floor)}
               className={`px-6 py-2 rounded-lg font-extrabold text-sm transition-all uppercase tracking-wider whitespace-nowrap ${
                 selectedFloor === floor 
                   ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                   : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
               }`}
             >
               Floor {floor}
             </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
        {displayedRooms.map((room) => (
           <ManagerRoomScheduleCard key={room.roomNumber} {...room} />
        ))}
        {displayedRooms.length === 0 && (
          <div className="col-span-full p-8 text-center bg-slate-100 rounded-3xl border border-slate-200 text-slate-500 font-bold">No rooms present on this floor layer.</div>
        )}
      </div>
    </div>
  );
};

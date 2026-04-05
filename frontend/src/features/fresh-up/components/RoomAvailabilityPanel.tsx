import React, { useState, useMemo, useEffect } from 'react';
import { FreshUpRoomAvailability } from '../types/freshUp.types';
import { RoomCard } from './RoomCard';

export interface RoomAvailabilityPanelProps {
  rooms: FreshUpRoomAvailability[];
  selectedRoomNumber?: string;
  onSelectRoom: (roomNumber: string) => void;
  loading?: boolean;
  error?: string;
}

export const RoomAvailabilityPanel: React.FC<RoomAvailabilityPanelProps> = ({ rooms, selectedRoomNumber, onSelectRoom, loading, error }) => {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  const primaryRooms = rooms.filter(r => r.isPrimary);
  const floors = useMemo(() => Array.from(new Set(primaryRooms.map(r => r.floor))).sort(), [primaryRooms]);
  
  useEffect(() => {
    if (floors.length > 0 && selectedFloor === null) {
      setSelectedFloor(floors[0]);
    }
  }, [floors, selectedFloor]);

  const displayedRooms = useMemo(() => {
     if (selectedFloor === null) return [];
     return primaryRooms.filter(r => r.floor === selectedFloor);
  }, [primaryRooms, selectedFloor]);

  if (loading) {
    return (
      <div className="mt-8 p-12 text-center border border-slate-200 border-dashed rounded-[2rem] animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded-full mx-auto mb-4"></div>
        <p className="text-sm font-bold tracking-widest uppercase text-slate-400">Scanning floor inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-8 text-center text-rose-600 border border-rose-200 bg-rose-50 rounded-[2rem]">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (primaryRooms.length === 0) {
    return <div className="mt-8 p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-sm bg-slate-100 rounded-[2rem] border border-slate-200 shadow-inner">No rooms configured on any floor.</div>;
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {floors.map(floor => (
          <button
            key={floor}
            onClick={() => setSelectedFloor(floor)}
            className={`px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all whitespace-nowrap ${
              selectedFloor === floor 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-600/20 ring-offset-2' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {floor}th Floor
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayedRooms.map(room => (
          <RoomCard
            key={room.roomNumber}
            {...room}
            isSelected={selectedRoomNumber === room.roomNumber}
            onSelect={() => onSelectRoom(room.roomNumber)}
          />
        ))}
      </div>
    </div>
  );
};

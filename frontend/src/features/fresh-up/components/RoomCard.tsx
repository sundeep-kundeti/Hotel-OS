import React from 'react';
import { FreshUpRoomStatus } from '../types/freshUp.types';

export interface RoomCardProps {
  roomNumber: string;
  status: FreshUpRoomStatus;
  matchedSlotAvailable: boolean;
  nextAvailableTime?: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  roomNumber,
  status,
  matchedSlotAvailable,
  nextAvailableTime,
  isSelected,
  onSelect,
}) => {
  const isAvailable = matchedSlotAvailable && status !== 'blocked';

  return (
    <button
      type="button"
      onClick={isAvailable ? onSelect : undefined}
      disabled={!isAvailable}
      className={`relative flex flex-col p-5 w-full text-left transition-all duration-300 rounded-3xl border ${
        isSelected
          ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-500/20 translate-y-[-2px]'
          : isAvailable
          ? 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg hover:translate-y-[-2px]'
          : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
      }`}
    >
      <div className="flex justify-between items-start w-full">
        <span className="text-2xl font-bold text-slate-800">{roomNumber}</span>
        {isSelected && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 shadow-sm animate-in zoom-in">
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </div>
      
      <div className="mt-4">
        {isAvailable ? (
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
            Available Slot
          </span>
        ) : (
          <span className="inline-block text-xs font-semibold text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-lg">
            {nextAvailableTime ? `Occupied until ${nextAvailableTime}` : 'Unavailable'}
          </span>
        )}
      </div>
    </button>
  );
};

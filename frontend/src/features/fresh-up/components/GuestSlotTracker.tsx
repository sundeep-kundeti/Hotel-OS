import React from 'react';
import { FreshUpRoomAvailability } from '../types/freshUp.types';

export interface GuestSlotTrackerProps {
  rooms: FreshUpRoomAvailability[];
  loading: boolean;
}

export const GuestSlotTracker: React.FC<GuestSlotTrackerProps> = ({ rooms, loading }) => {
  const availableCount = rooms.filter(r => r.status === 'available').length;

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 mt-8">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Live Availability</h3>
      
      {loading ? (
        <div className="flex items-center gap-3 text-slate-400 p-4 bg-slate-50 rounded-2xl animate-pulse">
           <div className="h-6 w-6 rounded-full bg-slate-200"></div>
           <span className="font-medium">Syncing with reception...</span>
        </div>
      ) : (
        <div className={`p-5 rounded-2xl border flex items-center justify-between transition-colors ${availableCount > 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex flex-col">
            <span className={`text-4xl font-extrabold ${availableCount > 0 ? 'text-indigo-700' : 'text-red-700'}`}>
              {availableCount} <span className="text-xl font-medium">Slots</span>
            </span>
            <span className={`text-sm mt-1 font-medium ${availableCount > 0 ? 'text-indigo-500' : 'text-red-500'}`}>
              Available at your selected time
            </span>
          </div>
          
          <div className="hidden sm:block">
            {availableCount > 0 ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs uppercase tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Ready To Book
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 font-bold text-xs uppercase tracking-wide">Fully Booked</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

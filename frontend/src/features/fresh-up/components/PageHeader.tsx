'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { BedDouble, Users } from 'lucide-react';

interface PageHeaderProps {
  availableSlots?: number;
  loadingSlots?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ availableSlots, loadingSlots }) => {
  const router = useRouter();

  return (
    <div className="mb-8 flex flex-col md:flex-row items-center md:items-start md:gap-8 gap-5 w-full bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm">
      <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-white/80 border border-slate-100 rounded-3xl p-3 flex items-center justify-center mt-2 md:mt-0">
         <img src="/logo.png" alt="Srinivasa Residency Logo" className="max-w-full max-h-full object-contain" />
      </div>
      <div className="flex-1 w-full text-center md:text-left flex flex-col justify-center">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-800 mb-1 leading-tight whitespace-nowrap">
          Srinivasa Residency by Srimuni
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <h2 className="text-base md:text-lg font-bold text-indigo-500 uppercase tracking-wide">
            Fresh Up Rooms
          </h2>
          {availableSlots !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-slate-300 hidden sm:inline">•</span>
              {loadingSlots ? (
                <span className="text-xs font-bold text-indigo-400 bg-indigo-50 px-2.5 py-1 rounded-full animate-pulse border border-indigo-100">Checking Slots...</span>
              ) : availableSlots > 0 ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {availableSlots} Slots Available
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 shadow-sm px-2.5 py-1 rounded-full">
                  Sold Out
                </span>
              )}
            </div>
          )}
        </div>
        
        <p className="text-slate-600 font-medium max-w-3xl text-sm md:text-base leading-relaxed mx-auto md:mx-0 mb-6">
          Book an hourly fresh-up room natively. Select your date, time, and duration for live availability. Strictly for wash & change purposes.
        </p>

        <div className="flex flex-wrap justify-center md:justify-start gap-3">
          <button
             onClick={() => router.push('/book')}
             className="flex items-center gap-2 bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm backdrop-blur-sm active:scale-[0.98]"
          >
             <BedDouble size={18} />
             <span>Book Rooms</span>
          </button>
          <button
             onClick={() => router.push('/group-stay')}
             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
             <Users size={18} />
             <span>Group Stays</span>
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { BedDouble, Users } from 'lucide-react';

export const PageHeader: React.FC = () => {
  const router = useRouter();

  return (
    <div className="mb-8 flex flex-col md:flex-row items-center md:items-start md:gap-8 gap-5 w-full bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm">
      <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-white/80 border border-slate-100 rounded-3xl p-3 flex items-center justify-center mt-2 md:mt-0">
         <img src="/logo.png" alt="Srinivasa Residency Logo" className="max-w-full max-h-full object-contain" />
      </div>
      <div className="text-center md:text-left flex-1 md:self-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-800 mb-2 leading-tight">
          Srinivasa Residency by Srimuni
        </h1>
        <h2 className="text-lg md:text-xl font-bold text-indigo-500 mb-3 uppercase tracking-wide">
          Fresh Up Rooms
        </h2>
        <p className="text-slate-600 font-medium max-w-2xl text-sm md:text-base leading-relaxed mx-auto md:mx-0">
          Book an hourly fresh-up room natively. Simply select your date, time, and duration to see live availability. Rooms are strictly for wash & change purposes. T&C Apply.
        </p>
      </div>
      <div className="md:self-center mt-4 md:mt-0 flex gap-2">
        <button
           onClick={() => router.push('/book')}
           className="flex items-center gap-2 bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 font-bold px-4 py-2 rounded-xl transition-all shadow-sm backdrop-blur-sm active:scale-[0.98]"
        >
           <BedDouble size={16} />
           <span className="hidden md:inline">Book Rooms</span>
        </button>
        <button
           onClick={() => router.push('/group-stay')}
           className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-[0.98]"
        >
           <Users size={16} />
           <span className="hidden md:inline">Group Stays</span>
        </button>
      </div>
    </div>
  );
};

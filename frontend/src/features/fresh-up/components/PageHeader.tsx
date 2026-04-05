import React from 'react';

export const PageHeader: React.FC = () => {
  return (
    <div className="mb-8 flex flex-col md:flex-row items-center md:items-start md:gap-8 gap-5">
      <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-white shadow-sm border border-slate-100 rounded-3xl p-3 flex items-center justify-center">
         <img src="/logo.png" alt="Srinivasa Residency Logo" className="max-w-full max-h-full object-contain" />
      </div>
      <div className="text-center md:text-left flex-1">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-800 mb-2 leading-tight">
          Srinivasa Residency by Srimuni
        </h1>
        <h2 className="text-lg md:text-xl font-bold text-indigo-500 mb-3 uppercase tracking-wide">
          Fresh Up Rooms
        </h2>
        <p className="text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed mx-auto md:mx-0">
          Book an hourly fresh-up room natively. Simply select your date, time, and duration to see live availability. Rooms are strictly for wash & change purposes. T&C Apply.
        </p>
      </div>
    </div>
  );
};

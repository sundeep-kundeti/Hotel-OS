import React from 'react';

export const DashboardHeader: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Fresh Up Operations</h1>
        <p className="text-slate-500 mt-1">Live overview of hourly room turnover and guest verifications.</p>
      </div>
      <div>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 shadow-sm shadow-emerald-100/50">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          Live Sync Active
        </span>
      </div>
    </div>
  );
};

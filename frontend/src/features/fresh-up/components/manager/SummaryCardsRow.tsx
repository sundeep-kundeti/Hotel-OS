import React from 'react';
import { FreshUpDashboardSummary } from '../../types/freshUp.types';

export interface SummaryCardsRowProps {
  summary: FreshUpDashboardSummary;
  loading?: boolean;
}

export const SummaryCardsRow: React.FC<SummaryCardsRowProps> = ({ summary, loading }) => {
  if (loading) return <div className="animate-pulse h-28 bg-slate-200 rounded-3xl mb-8"></div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <div className="bg-white rounded-[1.25rem] p-5 shadow-sm border border-slate-100/60">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Today's Bookings</p>
        <p className="text-3xl font-extrabold text-slate-800">{summary.totalBookingsToday}</p>
      </div>
      <div className="bg-white rounded-[1.25rem] p-5 shadow-sm border border-slate-100/60">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Occupied</p>
        <p className="text-3xl font-extrabold text-indigo-600">{summary.activeOccupiedRooms}</p>
      </div>
      <div className="bg-white rounded-[1.25rem] p-5 shadow-sm border border-slate-100/60">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Needs Cleaning</p>
        <p className="text-3xl font-extrabold text-amber-500">{summary.cleaningRooms}</p>
      </div>
      <div className="bg-white rounded-[1.25rem] p-5 shadow-sm border border-slate-100/60">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Available Rooms</p>
        <p className="text-3xl font-extrabold text-emerald-500">{summary.availablePrimaryRooms}</p>
      </div>
      <div className="bg-white rounded-[1.25rem] p-5 shadow-sm border border-slate-100/60">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pending Aadhaar</p>
        <p className="text-3xl font-extrabold text-rose-500">{summary.pendingVerification}</p>
      </div>
      <div className="bg-slate-900 rounded-[1.25rem] p-5 shadow-lg border border-slate-800">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Expected Coll.</p>
        <p className="text-3xl font-extrabold text-white">₹{summary.expectedCollectionToday}</p>
      </div>
    </div>
  );
};

import React from 'react';

export interface FilterBarProps {
  selectedDate: string;
  selectedRoomNumber?: string;
  selectedStatus?: string;
  searchText: string;
  onDateChange: (value: string) => void;
  onRoomChange: (value?: string) => void;
  onStatusChange: (value?: string) => void;
  onSearchChange: (value: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedDate, selectedStatus, searchText,
  onDateChange, onStatusChange, onSearchChange
}) => {
  return (
    <div className="bg-white rounded-[1.25rem] p-4 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center">
      <input type="date" className="h-12 rounded-xl border border-slate-200 px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full md:w-auto" value={selectedDate} onChange={(e) => onDateChange(e.target.value)} />
      
      <div className="relative w-full flex-1">
        <input type="text" placeholder="Search Guest Name or Booking ID..." className="h-12 rounded-xl border border-slate-200 pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full" value={searchText} onChange={(e) => onSearchChange(e.target.value)} />
        <svg className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>

      <select className="h-12 rounded-xl border border-slate-200 px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full md:w-48 appearance-none bg-white" value={selectedStatus || ''} onChange={(e) => onStatusChange(e.target.value || undefined)}>
        <option value="">All Statuses</option>
        <option value="pending_confirmation">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="checked_in">Checked In</option>
        <option value="cleaning">Cleaning</option>
      </select>
    </div>
  );
};

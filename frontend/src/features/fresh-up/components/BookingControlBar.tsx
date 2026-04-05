import React from 'react';

export interface BookingControlBarProps {
  selectedDate: string;
  selectedPax: 1 | 2;
  selectedDuration: 1 | 2 | 3;
  selectedStartTime: string;
  onDateChange: (value: string) => void;
  onPaxChange: (value: 1 | 2) => void;
  onDurationChange: (value: 1 | 2 | 3) => void;
  onStartTimeChange: (value: string) => void;
  disabled?: boolean;
}

export const BookingControlBar: React.FC<BookingControlBarProps> = ({
  selectedDate,
  selectedPax,
  selectedDuration,
  selectedStartTime,
  onDateChange,
  onPaxChange,
  onDurationChange,
  onStartTimeChange,
  disabled
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-lg shadow-slate-200/20 rounded-3xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-5">
      <div className="flex flex-col">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Check-in Date</label>
        <input
          type="date"
          className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 text-sm font-medium outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white disabled:opacity-50"
          value={selectedDate}
          min={new Date(new Date().getTime() + (330 + new Date().getTimezoneOffset()) * 60000).toISOString().slice(0, 10)}
          onChange={(e) => onDateChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Check-in Time</label>
        <div className="flex gap-2">
          <select
            className="w-full rounded-2xl border border-slate-200 px-2 py-3 text-slate-800 text-sm font-medium outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white disabled:opacity-50 appearance-none text-center"
            value={selectedStartTime.split(':')[0]}
            onChange={(e) => {
               const newHr = e.target.value;
               let newMin = selectedStartTime.split(':')[1];
               
               const d = new Date();
               d.setMinutes(d.getMinutes() + d.getTimezoneOffset() + 330);
               if (selectedDate === d.toISOString().slice(0, 10) && parseInt(newHr, 10) === d.getHours() && parseInt(newMin, 10) < d.getMinutes()) {
                   newMin = d.getMinutes().toString().padStart(2, '0');
               }
               onStartTimeChange(`${newHr}:${newMin}`);
            }}
            disabled={disabled}
          >
            {Array.from({ length: 24 }).map((_, i) => {
               const d = new Date();
               d.setMinutes(d.getMinutes() + d.getTimezoneOffset() + 330);
               const isToday = selectedDate === d.toISOString().slice(0, 10);
               const disabledHour = isToday && i < d.getHours();
               return (
                 <option key={`h-${i}`} value={i.toString().padStart(2, '0')} disabled={disabledHour}>
                   {i.toString().padStart(2, '0')}
                 </option>
               );
            })}
          </select>
          
          <span className="flex items-center text-slate-300 font-extrabold">:</span>
          
          <select
            className="w-full rounded-2xl border border-slate-200 px-2 py-3 text-slate-800 text-sm font-medium outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white disabled:opacity-50 appearance-none text-center"
            value={selectedStartTime.split(':')[1]}
            onChange={(e) => onStartTimeChange(`${selectedStartTime.split(':')[0]}:${e.target.value}`)}
            disabled={disabled}
          >
            {Array.from({ length: 60 }).map((_, i) => {
               const d = new Date();
               d.setMinutes(d.getMinutes() + d.getTimezoneOffset() + 330);
               const isToday = selectedDate === d.toISOString().slice(0, 10);
               const selHour = parseInt(selectedStartTime.split(':')[0] || '0', 10);
               const disabledMin = isToday && selHour === d.getHours() && i < d.getMinutes();
               return (
                 <option key={`m-${i}`} value={i.toString().padStart(2, '0')} disabled={disabledMin}>
                   {i.toString().padStart(2, '0')}
                 </option>
               );
            })}
          </select>
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Duration</label>
        <select
          className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 text-sm font-medium outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white disabled:opacity-50 appearance-none"
          value={selectedDuration}
          onChange={(e) => onDurationChange(Number(e.target.value) as 1 | 2 | 3)}
          disabled={disabled}
        >
          <option value={1}>1 Hour</option>
          <option value={2}>2 Hours</option>
          <option value={3}>3 Hours</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Pax Count</label>
        <select
          className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 text-sm font-medium outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white disabled:opacity-50 appearance-none"
          value={selectedPax}
          onChange={(e) => onPaxChange(Number(e.target.value) as 1 | 2)}
          disabled={disabled}
        >
          <option value={1}>1 Guest</option>
          <option value={2}>2 Guests</option>
        </select>
      </div>
    </div>
  );
};

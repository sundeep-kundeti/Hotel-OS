import React from 'react';

export interface BookingSummaryCardProps {
  roomNumber?: string;
  bookingDate: string;
  startTime: string;
  endTime?: string;
  cleaningEndTime?: string;
  paxCount: 1 | 2;
  durationHours: 1 | 2 | 3;
  amount: number;
  paymentMode: 'pay_at_hotel';
}

export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({
  roomNumber,
  bookingDate,
  startTime,
  endTime,
  paxCount,
  durationHours,
  amount,
  paymentMode
}) => {
  return (
    <div className="bg-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
      </div>
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">Booking Summary</h3>
      
      <div className="space-y-4 mb-8 relative z-10">
        <div className="flex justify-between items-center text-sm">
          <span className="text-indigo-200">Date</span>
          <span className="font-semibold text-white">{bookingDate}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-indigo-200">Time</span>
          <span className="font-semibold text-white">{startTime}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-indigo-200">Duration</span>
          <span className="font-semibold text-white">{durationHours} Hour{durationHours > 1 ? 's' : ''}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-indigo-200">Guests</span>
          <span className="font-semibold text-white">{paxCount} Pax</span>
        </div>
        
        {roomNumber && (
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
             <span className="text-indigo-200 text-sm">Assigned Room</span>
             <span className="font-bold text-emerald-400 text-lg">{roomNumber}</span>
          </div>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 flex justify-between items-end relative z-10 border border-white/5">
        <div>
          <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Total Due</p>
          <p className="text-3xl font-extrabold text-white">₹{amount}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-100 px-3 py-1.5 rounded-full uppercase tracking-widest border border-indigo-500/50">
            {paymentMode.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
    </div>
  );
};

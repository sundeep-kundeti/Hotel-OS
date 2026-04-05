import React from 'react';

export interface FreshUpBookingSuccessCardProps {
  bookingCode: string;
  roomNumber: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  amount: number;
}

export const FreshUpBookingSuccessCard: React.FC<FreshUpBookingSuccessCardProps> = ({
  bookingCode,
  roomNumber,
  bookingDate,
  startTime,
  endTime,
  amount
}) => {
  return (
    <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-200 shadow-2xl text-center max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100">
        <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Booking Confirmed!</h2>
      <p className="text-slate-500 mb-10 text-lg">Your Fresh Up room reservation has been officially secured.</p>
      
      <div className="bg-slate-50 rounded-3xl p-6 md:p-8 grid grid-cols-2 gap-y-8 gap-x-4 text-left border border-slate-100/50 relative overflow-hidden">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Booking Code</p>
          <p className="text-xl font-extrabold tracking-widest text-indigo-700 bg-indigo-50 inline-block px-3 py-1 rounded-xl">{bookingCode}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Amount to Pay</p>
          <p className="text-xl font-extrabold tracking-widest text-emerald-700">₹{amount}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Room No.</p>
          <p className="text-lg font-bold text-slate-900">{roomNumber} · Fresh Up</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date</p>
          <p className="text-lg font-bold text-slate-900">{bookingDate}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Start Time</p>
          <p className="text-lg font-bold text-slate-900">{startTime}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">End Time</p>
          <p className="text-lg font-bold text-slate-900">{endTime}</p>
        </div>
      </div>

      <div className="mt-10 p-6 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col gap-3 text-sm text-slate-700 text-left">
        <p className="font-bold text-amber-900 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Important Instructions
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-amber-400 font-medium">
          <li>Please arrive strictly 15 minutes before your start time.</li>
          <li>Original Aadhaar card matching your details exactly is mandatory.</li>
          <li>Payment will be collected at the front desk upon arrival.</li>
        </ul>
      </div>
      
      <button className="mt-8 w-full py-4 rounded-xl border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors" onClick={() => window.location.reload()}>
        Create Another Booking
      </button>
    </div>
  );
};

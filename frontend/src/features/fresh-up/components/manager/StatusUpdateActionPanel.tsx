import React from 'react';
import { FreshUpBookingStatus, FreshUpVerificationStatus } from '../../types/freshUp.types';

export interface StatusUpdateActionPanelProps {
  bookingStatus: FreshUpBookingStatus;
  verificationStatus: FreshUpVerificationStatus;
  onUpdateStatus: (status: FreshUpBookingStatus, remarks?: string) => void;
  loading?: boolean;
}

export const StatusUpdateActionPanel: React.FC<StatusUpdateActionPanelProps> = ({
  bookingStatus, verificationStatus, onUpdateStatus, loading
}) => {
  return (
    <div className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] border border-slate-200 mb-6">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
         <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 block"></span>
         Operations Control Center
      </h3>
      
      <div className="space-y-4">
        {bookingStatus === 'confirmed' && verificationStatus === 'verified' && (
          <button 
            disabled={loading} onClick={() => onUpdateStatus('checked_in')}
            className="w-full bg-emerald-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-between shadow-emerald-600/20 shadow-lg hover:bg-emerald-700 transition transform hover:scale-[1.02]"
          >
            <span className="flex items-center gap-3">
              <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Execute Confirmed Check-In
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-lg text-xs tracking-wider">SECURE</span>
          </button>
        )}

        {bookingStatus === 'confirmed' && verificationStatus !== 'verified' && (
          <div className="p-5 bg-amber-50 border border-amber-200/60 text-amber-900 rounded-2xl text-sm font-bold flex items-start gap-4">
             <div className="bg-amber-100 p-2 rounded-xl text-amber-600 shrink-0">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22M12 6l7.5 13h-15M11 10h2v4h-2M11 16h2v2h-2"></path></svg>
             </div>
             <div className="flex flex-col justify-center py-1">
               <span className="block mb-0.5">Physical Check-in Locked</span>
               <span className="font-medium text-amber-700/80 text-xs">Cannot check-in guest until Aadhaar is explicitly Verified by Manager oversight.</span>
             </div>
          </div>
        )}

        {bookingStatus === 'checked_in' && (
          <button 
            disabled={loading} onClick={() => onUpdateStatus('checked_out')}
            className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-black transition flex items-center justify-center gap-2 transform hover:-translate-y-1"
          >
            Check Out & Trigger Cleaning Dispatch ➔
          </button>
        )}

        {bookingStatus === 'cleaning' && (
          <button 
            disabled={loading} onClick={() => onUpdateStatus('completed')}
            className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition flex items-center justify-center gap-2 transform hover:-translate-y-1"
          >
            Mark Cleaning Complete & Release Room To Inventory
          </button>
        )}

        {['pending_confirmation', 'confirmed'].includes(bookingStatus) && (
          <button 
            className="w-full mt-6 bg-white border border-rose-200 text-rose-600 font-bold py-4 rounded-2xl hover:bg-rose-50 transition shadow-sm"
            disabled={loading} onClick={() => {
              const reason = window.prompt('Provide Executive Cancellation Reason for Audit Log Trace:');
              if (reason) onUpdateStatus('cancelled', reason);
            }}
          >
            Revoke & Cancel Reservation
          </button>
        )}

        {['completed', 'cancelled', 'rejected', 'no_show'].includes(bookingStatus) && (
          <div className="p-4 bg-slate-200/50 text-slate-500 font-extrabold tracking-[0.2em] text-center rounded-2xl text-[10px] border border-slate-200 shadow-inner">
            LIFECYCLE TERMINATED
          </div>
        )}
      </div>
    </div>
  );
};

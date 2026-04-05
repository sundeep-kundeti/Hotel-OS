import React from 'react';
import { ManagerBookingTableRow } from '../../types/freshUp.types';

export interface BookingDetailDrawerProps {
  isOpen: boolean;
  booking?: ManagerBookingTableRow;
  onClose: () => void;
  onAction?: (actionType: string) => void;
}

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = ({ isOpen, booking, onClose, onAction }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-all opacity-100 animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[460px] bg-white shadow-2xl z-50 transform transition-transform animate-in slide-in-from-right-full duration-300 border-l border-slate-200">
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800">Booking Management</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors text-xl">
            ✕
          </button>
        </div>

        {booking ? (
          <div className="overflow-y-auto h-[calc(100vh-80px)]">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-8">
                 <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Booking Code</p>
                   <p className="font-mono text-2xl font-black text-indigo-600">{booking.bookingCode}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Assigned Room</p>
                   <p className="text-2xl font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-xl">{booking.roomNumber}</p>
                 </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 mb-10 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-500">Guest Name</span>
                    <span className="font-extrabold text-slate-800 text-right">{booking.guestName}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-500">Contact No.</span>
                    <span className="font-extrabold text-slate-800 text-right">{booking.mobileNumber}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-500">Schedule</span>
                    <span className="font-extrabold text-slate-800 text-right">{booking.bookingDate} <br/> <span className="text-indigo-600 font-bold">{booking.startTime} - {booking.endTime}</span></span>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-semibold text-slate-500">Aadhaar Status</span>
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-black tracking-wider rounded-lg ${booking.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {booking.verificationStatus}
                    </span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-500">Collection</span>
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-black tracking-wider rounded-lg ${booking.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {booking.paymentStatus === 'paid' ? 'Paid: ₹' + booking.amount : 'Due: ₹' + booking.amount}
                    </span>
                 </div>
              </div>

              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1">Live Operations</h3>
              
              <div className="space-y-3">
                 {booking.paymentStatus !== 'paid' && booking.status !== 'cancelled' && (
                   <button onClick={() => onAction?.('record_payment')} className="w-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold py-4 px-6 rounded-2xl hover:bg-indigo-100 transition-all shadow-sm flex items-center justify-between group mb-2">
                     <span>Record Manual Payment (Cash/Card)</span>
                     <span className="text-indigo-300 group-hover:text-indigo-600 transition-colors">➔</span>
                   </button>
                 )}
                 {booking.status !== 'checked_in' && booking.status !== 'cleaning' && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                   <button onClick={() => onAction?.('check_in')} className="w-full bg-emerald-600 border border-emerald-500 text-white font-bold py-4 px-6 rounded-2xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-between group">
                     <span>Execute Check-In</span>
                     <span className="text-emerald-300 group-hover:text-white transition-colors">➔</span>
                   </button>
                 )}
                 {booking.status === 'checked_in' && (
                   <div className="w-full bg-slate-100 border border-slate-200 text-slate-400 font-bold py-4 px-6 rounded-2xl shadow-inner flex items-center justify-between cursor-default">
                     <span>Payment Recorded & Checked In</span>
                     <span>✓</span>
                   </div>
                 )}
                 {booking.status === 'checked_in' && (
                   <button onClick={() => onAction?.('check_out')} className="w-full bg-slate-900 border border-slate-800 text-white font-bold py-4 px-6 rounded-2xl hover:bg-black transition-all shadow-lg flex items-center justify-between group">
                     <span>Check Out & Trigger Cleaning</span>
                     <span className="text-slate-500 group-hover:text-white transition-colors">➔</span>
                   </button>
                 )}
                 {booking.status === 'cleaning' && (
                   <button onClick={() => onAction?.('completed')} className="w-full bg-amber-500 border border-amber-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-amber-600 transition-all shadow-lg flex items-center justify-between group">
                     <span>Mark Room Cleaned & Complete</span>
                     <span className="text-amber-200 group-hover:text-white transition-colors">➔</span>
                   </button>
                 )}
                 {booking.status !== 'checked_in' && booking.status !== 'cleaning' && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                   <button onClick={() => onAction?.('reassign')} className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-4 px-6 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-between group">
                     <span>Re-assign Alternate Room</span>
                     <span className="text-slate-300 group-hover:text-slate-600 transition-colors">➔</span>
                   </button>
                 )}
                 {booking.verificationStatus === 'pending' && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                   <button onClick={() => onAction?.('verify')} className="w-full bg-white border border-indigo-200 text-indigo-700 font-bold py-4 px-6 rounded-2xl hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm flex items-center justify-between group mt-2">
                     <span>Authenticate Aadhaar Card</span>
                     <span className="text-indigo-300 group-hover:text-indigo-600 transition-colors">➔</span>
                   </button>
                 )}
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                 <button onClick={() => onAction?.('cancel')} className="text-[10px] text-rose-500 font-black uppercase tracking-widest hover:text-rose-700 transition-colors">
                   Cancel & Revoke Reservation
                 </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 font-medium">Synchronizing booking payload...</div>
        )}
      </div>
    </>
  );
};

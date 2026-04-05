import React from 'react';
import { ManagerBookingTableRow } from '../../types/freshUp.types';

export interface BookingTableProps {
  rows: ManagerBookingTableRow[];
  onViewBooking: (bookingId: string) => void;
  onAction?: (payload: { type: string; bookingId: string }) => void;
  loading?: boolean;
}

export const BookingTable: React.FC<BookingTableProps> = ({ rows, onViewBooking, loading }) => {
  if (loading) return <div className="animate-pulse h-64 bg-slate-100 rounded-[1.5rem]"></div>;

  return (
    <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden mb-16">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-[10px] border-b border-slate-200">
            <tr>
              <th className="px-6 py-5">Booking ID</th>
              <th className="px-6 py-5">Guest Profile</th>
              <th className="px-6 py-5">Room</th>
              <th className="px-6 py-5">Schedule</th>
              <th className="px-6 py-5">Payment</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.bookingId} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{row.bookingCode}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="font-extrabold text-slate-800">{row.guestName}</p>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{row.mobileNumber}</p>
                </td>
                <td className="px-6 py-4 font-extrabold text-slate-900">{row.roomNumber}</td>
                <td className="px-6 py-4">
                  <p className="text-slate-800 font-bold">{row.bookingDate}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{row.startTime} - {row.endTime}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${row.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {row.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-slate-200/50">
                    {row.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onViewBooking(row.bookingId)} className="text-indigo-600 font-bold text-xs bg-indigo-50 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-100">
                    Manage ➔
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-12 text-center text-slate-500 font-medium">No reservations found matching the filters.</div>
        )}
      </div>
    </div>
  );
};

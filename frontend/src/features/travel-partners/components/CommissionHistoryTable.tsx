'use client';

import { CommissionEntry } from '../types/travelPartner.types';
import StatusBadge from './StatusBadge';
import { formatDateTime, formatCurrency } from '../utils/normalize';

type CommissionHistoryTableProps = {
  commissions: CommissionEntry[];
  loading?: boolean;
};

export default function CommissionHistoryTable({ commissions, loading }: CommissionHistoryTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (commissions.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <div className="text-4xl mb-2">💰</div>
        <p className="text-sm">No commission entries yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {commissions.map((c) => (
        <div key={c.id} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900">₹{c.commission_amount.toLocaleString('en-IN')}</span>
                <StatusBadge status={c.commission_status} />
                {c.payment_mode !== 'Pending' && (
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{c.payment_mode}</span>
                )}
              </div>
              {c.customer_name && (
                <p className="text-sm text-slate-600 mt-0.5">Guest: {c.customer_name} {c.room_number && `· Room ${c.room_number}`}</p>
              )}
              {c.booking_amount > 0 && (
                <p className="text-xs text-slate-400 mt-0.5">Booking: ₹{c.booking_amount.toLocaleString('en-IN')}</p>
              )}
              {c.notes && <p className="text-xs text-slate-400 mt-1 italic">{c.notes}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-400">{formatDateTime(c.created_at)}</p>
              {c.entered_by && <p className="text-xs text-slate-400 mt-0.5">by {c.entered_by}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

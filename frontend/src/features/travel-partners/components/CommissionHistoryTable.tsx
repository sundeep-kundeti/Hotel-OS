'use client';

import { useState } from 'react';
import { CommissionEntry, PaymentMode } from '../types/travelPartner.types';
import StatusBadge from './StatusBadge';
import { formatDateTime, formatCurrency } from '../utils/normalize';
import { tpFetch } from '../../../lib/tpApi';

type CommissionHistoryTableProps = {
  commissions: CommissionEntry[];
  loading?: boolean;
  onMarkPaid?: () => void; // callback to refresh parent data
};

const PAID_MODES: PaymentMode[] = ['Cash', 'UPI', 'Bank Transfer', 'Adjusted'];

function MarkPaidRow({ commission, onDone }: { commission: CommissionEntry; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PaymentMode>('Cash');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setSaving(true);
    setError('');
    try {
      const res = await tpFetch(`/tp-commissions/${commission.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ payment_mode: mode }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to update');
      }
      onDone();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full transition-colors"
      >
        ✓ Mark as Paid
      </button>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as PaymentMode)}
        disabled={saving}
        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-emerald-400"
      >
        {PAID_MODES.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <button
        onClick={handleConfirm}
        disabled={saving}
        className="text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-full transition-colors disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Confirm Paid'}
      </button>
      <button
        onClick={() => { setOpen(false); setError(''); }}
        disabled={saving}
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
      >
        Cancel
      </button>
      {error && <p className="text-xs text-red-500 w-full">{error}</p>}
    </div>
  );
}

export default function CommissionHistoryTable({ commissions, loading, onMarkPaid }: CommissionHistoryTableProps) {
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
            <div className="min-w-0 flex-1">
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

              {/* Mark as Paid — only shown for Pending entries */}
              {c.commission_status === 'Pending' && onMarkPaid && (
                <MarkPaidRow commission={c} onDone={onMarkPaid} />
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-400">{formatDateTime(c.created_at)}</p>
              {c.entered_by && <p className="text-xs text-slate-400 mt-0.5">by {c.entered_by}</p>}
              {c.paid_at && (
                <p className="text-xs text-emerald-500 mt-0.5">Paid {formatDateTime(c.paid_at)}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

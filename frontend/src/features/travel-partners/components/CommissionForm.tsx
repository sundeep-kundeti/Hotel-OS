'use client';

import { useState } from 'react';
import { commissionStatusValues, paymentModeValues } from '../schemas/travelPartner.schemas';
import { CreateCommissionFormValues } from '../types/travelPartner.types';

type CommissionFormProps = {
  partnerId: string;
  partnerName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const defaultValues: CreateCommissionFormValues = {
  customer_name: '',
  room_number: '',
  booking_amount: '',
  commission_amount: '',
  commission_status: 'Pending',
  payment_mode: 'Pending',
  notes: '',
};

export default function CommissionForm({ partnerId, partnerName, onSuccess, onCancel }: CommissionFormProps) {
  const [values, setValues] = useState<CreateCommissionFormValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateCommissionFormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  function set(field: keyof CreateCommissionFormValues, val: string) {
    setValues((v) => ({ ...v, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    const newErrors: typeof errors = {};

    if (!values.commission_amount || Number(values.commission_amount) <= 0) {
      newErrors.commission_amount = 'Commission amount is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/travel-partners/${partnerId}/commissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          booking_amount: values.booking_amount ? Number(values.booking_amount) : 0,
          commission_amount: Number(values.commission_amount),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'Failed to save commission');
        return;
      }
      onSuccess?.();
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
        <h2 className="font-bold text-slate-900">Add Commission Entry</h2>
        {partnerName && <p className="text-xs text-slate-500 mt-0.5">For: {partnerName}</p>}
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            ⚠️ {serverError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormInput
            id="comm-customer-name"
            label="Customer Name"
            value={values.customer_name}
            onChange={(v) => set('customer_name', v)}
            placeholder="Guest name"
          />
          <FormInput
            id="comm-room-number"
            label="Room Number"
            value={values.room_number}
            onChange={(v) => set('room_number', v)}
            placeholder="203"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormInput
            id="comm-booking-amount"
            label="Booking Amount (₹)"
            type="number"
            inputMode="numeric"
            value={values.booking_amount}
            onChange={(v) => set('booking_amount', v)}
            placeholder="1500"
          />
          <FormInput
            id="comm-commission-amount"
            label="Commission Amount (₹) *"
            type="number"
            inputMode="numeric"
            value={values.commission_amount}
            onChange={(v) => set('commission_amount', v)}
            placeholder="200"
            error={errors.commission_amount}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormSelect
            id="comm-status"
            label="Commission Status"
            value={values.commission_status}
            onChange={(v) => set('commission_status', v)}
            options={commissionStatusValues as unknown as string[]}
          />
          <FormSelect
            id="comm-payment-mode"
            label="Payment Mode"
            value={values.payment_mode}
            onChange={(v) => set('payment_mode', v)}
            options={paymentModeValues as unknown as string[]}
          />
        </div>

        <div>
          <label htmlFor="comm-notes" className="block text-xs font-medium text-slate-600 mb-1.5">Notes</label>
          <textarea
            id="comm-notes"
            value={values.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Customer came via driver referral…"
            rows={2}
            className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none resize-none"
          />
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border-2 border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all"
            >
              Cancel
            </button>
          )}
          <button
            id="save-commission-btn"
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              '💰 Save Commission'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormInput({
  id, label, value, onChange, placeholder, type = 'text', inputMode, error,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <input
        id={id} type={type} inputMode={inputMode} value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm focus:outline-none transition-colors ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-emerald-500'}`}
      />
      {error && <p className="mt-0.5 text-xs text-red-600">⚠️ {error}</p>}
    </div>
  );
}

function FormSelect({ id, label, value, onChange, options }: {
  id: string; label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <select
        id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none bg-white"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

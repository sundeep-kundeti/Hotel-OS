'use client';

import { useState } from 'react';
import { contactMethodValues, responseStatusValues } from '../schemas/travelPartner.schemas';
import { CreateFollowupFormValues } from '../types/travelPartner.types';

type FollowupFormProps = {
  partnerId: string;
  partnerName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const defaultValues: CreateFollowupFormValues = {
  contact_method: '',
  response_status: '',
  next_followup_at: '',
  notes: '',
};

export default function FollowupForm({ partnerId, partnerName, onSuccess, onCancel }: FollowupFormProps) {
  const [values, setValues] = useState<CreateFollowupFormValues>(defaultValues);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  function set(field: keyof CreateFollowupFormValues, val: string) {
    setValues((v) => ({ ...v, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/travel-partners/${partnerId}/followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_method: values.contact_method || undefined,
          response_status: values.response_status || undefined,
          next_followup_at: values.next_followup_at || null,
          notes: values.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'Failed to save follow-up');
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
      <div className="px-4 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50">
        <h2 className="font-bold text-slate-900">Add Follow-up Log</h2>
        {partnerName && <p className="text-xs text-slate-500 mt-0.5">For: {partnerName}</p>}
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            ⚠️ {serverError}
          </div>
        )}

        {/* Contact method — pill buttons */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Contact Method</label>
          <div className="flex gap-2 flex-wrap">
            {contactMethodValues.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set('contact_method', values.contact_method === m ? '' : m)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
                  values.contact_method === m
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-violet-400'
                }`}
              >
                {m === 'Call' ? '📞' : m === 'WhatsApp' ? '💬' : '🚶'} {m}
              </button>
            ))}
          </div>
        </div>

        {/* Response status */}
        <div>
          <label htmlFor="followup-response" className="block text-xs font-medium text-slate-600 mb-1.5">
            Response Status
          </label>
          <select
            id="followup-response"
            value={values.response_status}
            onChange={(e) => set('response_status', e.target.value)}
            className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-violet-500 focus:outline-none bg-white"
          >
            <option value="">— Select status —</option>
            {responseStatusValues.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Next follow-up date */}
        <div>
          <label htmlFor="followup-next-date" className="block text-xs font-medium text-slate-600 mb-1.5">
            Next Follow-up Date (optional)
          </label>
          <input
            id="followup-next-date"
            type="datetime-local"
            value={values.next_followup_at}
            onChange={(e) => set('next_followup_at', e.target.value)}
            className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-violet-500 focus:outline-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="followup-notes" className="block text-xs font-medium text-slate-600 mb-1.5">Notes</label>
          <textarea
            id="followup-notes"
            value={values.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Driver was interested, asked to send hotel tariff card…"
            rows={3}
            className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none resize-none"
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
            id="save-followup-btn"
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              '📝 Save Follow-up'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

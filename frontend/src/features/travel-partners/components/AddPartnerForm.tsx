'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPartnerSchema, partnerStatusValues, leadSourceValues } from '../schemas/travelPartner.schemas';
import { CreatePartnerFormValues } from '../types/travelPartner.types';
import { normalizePhoneNumber, normalizeVehicleNumber, formatVehicleNumber } from '../utils/normalize';

type AddPartnerFormProps = {
  prefillPhone?: string;
  prefillVehicle?: string;
  onSuccess?: (partnerId: string) => void;
};

const defaultValues: CreatePartnerFormValues = {
  phone_number: '',
  vehicle_number: '',
  driver_name: '',
  vehicle_make: '',
  lead_source: 'Vehicle Number Seen',
  partner_status: 'Lead Only',
  notes: '',
};

export default function AddPartnerForm({ prefillPhone, prefillVehicle, onSuccess }: AddPartnerFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CreatePartnerFormValues>({
    ...defaultValues,
    phone_number: prefillPhone || '',
    vehicle_number: prefillVehicle || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreatePartnerFormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [createdPartnerId, setCreatedPartnerId] = useState<string | null>(null);

  function set(field: keyof CreatePartnerFormValues, val: string) {
    setValues((v) => ({ ...v, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');

    const parsed = createPartnerSchema.safeParse({
      ...values,
      phone_number: normalizePhoneNumber(values.phone_number),
      vehicle_number: normalizeVehicleNumber(values.vehicle_number),
    });

    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setErrors({
        phone_number: flat.phone_number?.[0],
        vehicle_number: flat.vehicle_number?.[0],
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/travel-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'Failed to save partner');
        return;
      }
      setCreatedPartnerId(data.partner.id);
      onSuccess?.(data.partner.id);
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Success state — show action buttons
  if (createdPartnerId) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 p-6 text-center space-y-4 animate-in zoom-in-95">
        <div className="text-5xl">✅</div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Partner Created Successfully!</h3>
          <p className="text-sm text-slate-500 mt-1">What would you like to do next?</p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            id="add-commission-now-btn"
            onClick={() => router.push(`/travel-partners/${createdPartnerId}?action=commission`)}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-base font-semibold text-white shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            💰 Add Commission Now
          </button>
          <button
            id="save-lead-only-btn"
            onClick={() => router.push(`/travel-partners/${createdPartnerId}`)}
            className="w-full rounded-xl border-2 border-slate-200 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
          >
            Save as Lead Only →
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-4 border-b border-slate-100 bg-slate-50">
        <h2 className="font-bold text-slate-900">Add New Travel Partner</h2>
        <p className="text-xs text-slate-500 mt-0.5">No matching partner found — register them now</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            ⚠️ {serverError}
          </div>
        )}

        {/* Phone + Vehicle */}
        <div className="grid grid-cols-2 gap-3">
          <FieldInput
            id="field-phone"
            label="Phone Number *"
            type="tel"
            inputMode="numeric"
            value={values.phone_number}
            onChange={(v) => set('phone_number', v)}
            placeholder="9876543210"
            error={errors.phone_number}
          />
          <FieldInput
            id="field-vehicle"
            label="Vehicle Number *"
            value={values.vehicle_number}
            onChange={(v) => set('vehicle_number', v.toUpperCase())}
            placeholder="KA03AB1234"
            hint={values.vehicle_number ? formatVehicleNumber(normalizeVehicleNumber(values.vehicle_number)) : undefined}
            error={errors.vehicle_number}
          />
        </div>

        {/* Driver name + Vehicle make */}
        <div className="grid grid-cols-2 gap-3">
          <FieldInput
            id="field-driver-name"
            label="Driver Name"
            value={values.driver_name}
            onChange={(v) => set('driver_name', v)}
            placeholder="Ramesh"
          />
          <FieldInput
            id="field-vehicle-make"
            label="Vehicle Make"
            value={values.vehicle_make}
            onChange={(v) => set('vehicle_make', v)}
            placeholder="Innova Crysta"
          />
        </div>

        {/* Lead Source */}
        <FieldSelect
          id="field-lead-source"
          label="Lead Source"
          value={values.lead_source}
          onChange={(v) => set('lead_source', v)}
          options={leadSourceValues as unknown as string[]}
        />

        {/* Partner Status */}
        <FieldSelect
          id="field-partner-status"
          label="Partner Status"
          value={values.partner_status}
          onChange={(v) => set('partner_status', v)}
          options={partnerStatusValues as unknown as string[]}
        />

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Notes</label>
          <textarea
            id="field-notes"
            value={values.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Seen near hotel entrance, friendly driver…"
            rows={3}
            className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>

        <button
          id="save-partner-btn"
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 text-base font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving…
            </span>
          ) : (
            '💾 Save Partner'
          )}
        </button>
      </div>
    </form>
  );
}

// ──────────────────────────────────────────
// Sub-components for cleaner form code
// ──────────────────────────────────────────

function FieldInput({
  id, label, value, onChange, placeholder, type = 'text', inputMode, error, hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  error?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-mono focus:outline-none transition-colors ${
          error ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-500'
        }`}
      />
      {hint && <p className="mt-0.5 text-xs text-slate-400 font-mono">{hint}</p>}
      {error && <p className="mt-0.5 text-xs text-red-600">⚠️ {error}</p>}
    </div>
  );
}

function FieldSelect({
  id, label, value, onChange, options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none bg-white"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

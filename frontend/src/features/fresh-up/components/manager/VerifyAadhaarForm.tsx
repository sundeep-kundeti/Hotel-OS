import React from 'react';
import { AadhaarVerificationFormValues } from '../../types/freshUp.types';

export interface VerifyAadhaarFormProps {
  values: AadhaarVerificationFormValues;
  errors: Partial<Record<keyof AadhaarVerificationFormValues, string>>;
  onChange: (field: keyof AadhaarVerificationFormValues, value: string | boolean) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export const VerifyAadhaarForm: React.FC<VerifyAadhaarFormProps> = ({ values, errors, onChange, onSubmit, loading }) => {
  return (
    <div className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Aadhaar Authentication</h3>
      
      <div className="space-y-6">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700 mb-2 block">Verification Outcome</span>
          <select 
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            value={values.verificationResult} 
            onChange={(e) => onChange('verificationResult', e.target.value)}
          >
            <option value="pending">Select Outcome...</option>
            <option value="verified">Verified - Identity Matches Perfectly</option>
            <option value="rejected">Rejected - Discrepancy Found</option>
            <option value="manual_review">Flagged - Requires GM Approval</option>
          </select>
          {errors.verificationResult && <p className="text-xs text-red-500 mt-1">{errors.verificationResult}</p>}
        </label>

        <label className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer">
          <input 
            type="checkbox" className="mt-1 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            checked={values.districtValid} 
            onChange={(e) => onChange('districtValid', e.target.checked)} 
          />
          <div>
            <span className="text-sm font-semibold text-slate-700">Verified Guest is strictly NOT a local resident of Tirupati District.</span>
            {errors.districtValid && <p className="text-xs text-red-500 mt-1">{errors.districtValid}</p>}
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700 mb-2 block">Manager Identity Override/Remarks (Optional)</span>
          <textarea 
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white min-h-[100px]"
            value={values.managerRemarks} 
            onChange={(e) => onChange('managerRemarks', e.target.value)}
            placeholder="Record any deviations or supervisor overrides here..."
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700 mb-2 block">Verified By (Staff ID)</span>
          <input 
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-mono"
            value={values.verifiedBy} 
            onChange={(e) => onChange('verifiedBy', e.target.value)}
            placeholder="e.g. EMP-1044"
          />
          {errors.verifiedBy && <p className="text-xs text-red-500 mt-1">{errors.verifiedBy}</p>}
        </label>

        <button 
          onClick={onSubmit}
          disabled={loading || values.verificationResult === 'pending' || !values.verifiedBy}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Commit Verification Log to Audit'}
        </button>
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import { CustomerDetailsFormValues } from '../types/freshUp.types';
import { getAllStates, getDistricts } from 'india-state-district';

export interface CustomerDetailsFormProps {
  values: CustomerDetailsFormValues;
  errors: Partial<Record<keyof CustomerDetailsFormValues, string>>;
  onChange: (field: keyof CustomerDetailsFormValues, value: string | boolean | number) => void;
  disabled?: boolean;
}

export const CustomerDetailsForm: React.FC<CustomerDetailsFormProps> = ({ values, errors, onChange, disabled }) => {
  const statesList = useMemo(() => getAllStates(), []);
  
  const activeStateCode = useMemo(() => {
     if (!values.aadhaarState) return '';
     const st = statesList.find(s => s.name === values.aadhaarState);
     return st ? st.code : '';
  }, [values.aadhaarState, statesList]);

  const activeDistrictsList = useMemo(() => {
     if (!activeStateCode) return [];
     return getDistricts(activeStateCode) || [];
  }, [activeStateCode]);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mt-8 space-y-8">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Primary Guest Authentication</h3>
        <p className="text-sm text-slate-500 mt-1">Please provide exact details as printed strictly on your Aadhaar card.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-slate-700 mb-2 block">Full Name (As per Aadhaar)</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            value={values.fullName} onChange={(e) => onChange('fullName', e.target.value)} disabled={disabled} placeholder="John Doe"
          />
          {errors.fullName && <p className="text-xs font-medium text-red-500 mt-1.5">{errors.fullName}</p>}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700 mb-2 block">Gender</span>
          <select
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white appearance-none"
            value={values.gender} onChange={(e) => onChange('gender', e.target.value)} disabled={disabled}
          >
             <option value="">Select Gender</option>
             <option value="male">Male</option>
             <option value="female">Female</option>
             <option value="other">Other</option>
          </select>
          {errors.gender && <p className="text-xs font-medium text-red-500 mt-1.5">{errors.gender}</p>}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700 mb-2 block">Mobile Number</span>
          <input
            type="tel" className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            value={values.mobileNumber} onChange={(e) => onChange('mobileNumber', e.target.value)} disabled={disabled} placeholder="9000000000" maxLength={10}
          />
          {errors.mobileNumber && <p className="text-xs font-medium text-red-500 mt-1.5">{errors.mobileNumber}</p>}
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-slate-700 mb-2 block">Aadhaar Number (12 Digits)</span>
          <input
            type="text" className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono tracking-widest text-lg placeholder:text-base placeholder:tracking-normal"
            value={values.aadhaarNumber} onChange={(e) => onChange('aadhaarNumber', e.target.value)} disabled={disabled} placeholder="xxxx xxxx xxxx" maxLength={12}
          />
          {errors.aadhaarNumber && <p className="text-xs font-medium text-red-500 mt-1.5">{errors.aadhaarNumber}</p>}
        </label>
        
        <label className="block md:col-span-2 hidden">
          <span className="text-sm font-semibold text-slate-700 mb-2 block">Aadhaar Name</span>
          <input
            type="text" className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            value={values.aadhaarName = values.fullName} onChange={() => {}} disabled={disabled}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700 mb-2 block">Aadhaar State</span>
          <select
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white appearance-none"
            value={values.aadhaarState} 
            onChange={(e) => {
              onChange('aadhaarState', e.target.value);
              onChange('aadhaarDistrict', '');
            }} 
            disabled={disabled}
          >
            <option value="">Select State</option>
            {statesList.map(s => (
               <option key={s.code} value={s.name}>{s.name}</option>
            ))}
          </select>
          {errors.aadhaarState && <p className="text-xs font-medium text-red-500 mt-1.5">{errors.aadhaarState}</p>}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700 mb-2 block">Aadhaar District</span>
          <select
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white appearance-none"
            value={values.aadhaarDistrict} 
            onChange={(e) => onChange('aadhaarDistrict', e.target.value)} 
            disabled={disabled || !values.aadhaarState}
          >
            <option value="">Select District</option>
            {activeDistrictsList.map(d => (
               <option key={d as string} value={d as string}>{d}</option>
            ))}
          </select>
          {errors.aadhaarDistrict && <p className="text-xs font-medium text-red-500 mt-1.5">{errors.aadhaarDistrict}</p>}
        </label>
      </div>

      <div className="pt-8 border-t border-slate-100 flex flex-col gap-5">
        <label className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/80 transition-colors">
          <input type="checkbox" className="mt-0.5 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={values.declarationOutsideTirupati} onChange={(e) => onChange('declarationOutsideTirupati', e.target.checked)} disabled={disabled} />
           <div>
             <span className="text-sm font-bold text-slate-800 block">I declare that I am not a local resident of Tirupati District.</span>
             <p className="text-xs text-slate-500 mt-1 leading-relaxed">Local residents are strictly prohibited from booking fresh-up rooms due to operational protocol.</p>
             {errors.declarationOutsideTirupati && <p className="text-xs font-medium text-red-500 mt-1.5">{errors.declarationOutsideTirupati}</p>}
           </div>
        </label>

        <label className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/80 transition-colors">
          <input type="checkbox" className="mt-0.5 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={values.declarationAadhaarVerificationAccepted} onChange={(e) => onChange('declarationAadhaarVerificationAccepted', e.target.checked)} disabled={disabled} />
           <div>
             <span className="text-sm font-bold text-slate-800 block">I acknowledge mandatory physical Aadhaar verification.</span>
             <p className="text-xs text-slate-500 mt-1 leading-relaxed">Original Aadhaar card matching these details exactly must be physically scanned at the front desk before the room key is issued.</p>
             {errors.declarationAadhaarVerificationAccepted && <p className="text-xs font-medium text-red-500 mt-1.5">{errors.declarationAadhaarVerificationAccepted}</p>}
           </div>
        </label>

        <label className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/80 transition-colors">
          <input type="checkbox" className="mt-0.5 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={values.declarationPayAtHotelAccepted} onChange={(e) => onChange('declarationPayAtHotelAccepted', e.target.checked)} disabled={disabled} />
           <div>
             <span className="text-sm font-bold text-slate-800 block">I accept the Pay at Hotel terms of service.</span>
             <p className="text-xs text-slate-500 mt-1 leading-relaxed">Booking is secured immediately. Payment will be collected upfront at the front desk upon arrival.</p>
             {errors.declarationPayAtHotelAccepted && <p className="text-xs font-medium text-red-500 mt-1.5">{errors.declarationPayAtHotelAccepted}</p>}
           </div>
        </label>
      </div>
    </div>
  );
};

import React from 'react';
import { AssignAlternateRoomFormValues } from '../../types/freshUp.types';

export interface AssignAlternateRoomFormProps {
  values: AssignAlternateRoomFormValues;
  availableRooms: string[];
  errors: Partial<Record<keyof AssignAlternateRoomFormValues, string>>;
  onChange: (field: keyof AssignAlternateRoomFormValues, value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export const AssignAlternateRoomForm: React.FC<AssignAlternateRoomFormProps> = ({
  values, availableRooms, errors, onChange, onSubmit, loading
}) => {
  return (
    <div className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Reassign Alternate Room</h3>
      
      <div className="space-y-6">
         <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
           <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Current Assigned Room</span>
           <span className="text-2xl font-black text-rose-600">{values.currentRoomNumber}</span>
         </div>

         <label className="block">
          <span className="text-sm font-semibold text-slate-700 mb-2 block">New Room Assignment</span>
          <select 
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-bold text-lg"
            value={values.alternateRoomNumber} 
            onChange={(e) => onChange('alternateRoomNumber', e.target.value)}
          >
            <option value="">Select Available Room...</option>
            {availableRooms.map(room => (
               <option key={room} value={room}>Room {room}</option>
            ))}
          </select>
          {errors.alternateRoomNumber && <p className="text-xs text-red-500 mt-1">{errors.alternateRoomNumber}</p>}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700 mb-2 block">Reason for Relocation</span>
          <select 
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            value={values.reason} 
            onChange={(e) => onChange('reason', e.target.value)}
          >
            <option value="">Select Protocol Reason...</option>
            <option value="maintenance">Unscheduled Maintenance / Plumbing</option>
            <option value="cleaning_delay">Previous Guest Overstayed / Cleaning Delay</option>
            <option value="guest_request">Honor Physical Guest Request</option>
            <option value="ac_failure">A/C Failure</option>
          </select>
          {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700 mb-2 block">Operational Remarks</span>
          <textarea 
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white min-h-[100px]"
            value={values.remarks} 
            onChange={(e) => onChange('remarks', e.target.value)}
            placeholder="Mandatory context for database audit log trace..."
          />
        </label>

        <button 
          onClick={onSubmit}
          disabled={loading || !values.alternateRoomNumber || !values.reason}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-colors disabled:opacity-50 shadow-md mt-4"
        >
          {loading ? 'Reassigning in Database...' : 'Force Reassign Constraint & Release Room'}
        </button>
      </div>
    </div>
  );
};

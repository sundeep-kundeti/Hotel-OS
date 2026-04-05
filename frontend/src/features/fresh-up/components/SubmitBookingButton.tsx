import React from 'react';

export interface SubmitBookingButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick?: () => void;
}

export const SubmitBookingButton: React.FC<SubmitBookingButtonProps> = ({ disabled, loading, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all flex justify-center items-center gap-2
        ${disabled 
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/30'
        }`}
    >
      {loading ? (
        <>
          <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Reserving Room...
        </>
      ) : (
        "Confirm Secure Reservation"
      )}
    </button>
  );
};

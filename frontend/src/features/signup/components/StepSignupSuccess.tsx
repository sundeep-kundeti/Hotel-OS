import React from 'react';
import { Check } from 'lucide-react';
import { PrimaryButton } from './shared/PrimaryButton';
import { SignupFlowState } from '../types/signup.types';

export type StepSignupSuccessProps = {
  guestName: string;
  wallet?: SignupFlowState['wallet'];
  offers?: SignupFlowState['offers'];
  onContinueToBooking: () => void;
  onViewProfile?: () => void;
};

export function StepSignupSuccess({
  guestName,
  wallet,
  offers,
  onContinueToBooking,
  onViewProfile,
}: StepSignupSuccessProps) {
  return (
    <div className="flex flex-col flex-1 h-full sm:h-auto items-center text-center">
      
      <div className="flex-1 flex flex-col items-center justify-center pt-8 pb-4 w-full max-w-sm mx-auto">
        <div className="w-16 h-16 bg-[#1a365d] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#1a365d]/20 animate-in zoom-in duration-500">
          <Check className="w-8 h-8 text-white" strokeWidth={3} />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome, {guestName.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mb-10">
          Your guest account is ready
        </p>

        {/* Optional Rewards & Offers Summary */}
        {(wallet || offers) && (
          <div className="w-full flex w-full flex-col gap-3 mb-8 text-left">
            {wallet && (
              <div className="bg-[var(--color-hotel-gold)]/10 border border-[var(--color-hotel-gold)]/20 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-hotel-gold-light)] mb-0.5">Rewards Status</p>
                  <p className="font-semibold text-[#1a365d]">Tier {wallet.tierCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--color-hotel-gold-light)] leading-none">{wallet.availablePoints}</p>
                  <p className="text-[10px] font-medium text-gray-500 uppercase">Points</p>
                </div>
              </div>
            )}
            
            {offers && offers.length > 0 && (
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-blue-100 p-1.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">Welcome Offer Unlocked</p>
                  <p className="text-xs text-gray-500">Code <span className="font-mono bg-white px-1 py-0.5 rounded border">{offers[0].offerCode}</span> ready to use</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto sm:mt-12 flex flex-col gap-4 w-full">
        <PrimaryButton 
          label="Continue to Booking" 
          onClick={onContinueToBooking} 
        />
        
        {onViewProfile && (
          <button
            type="button"
            onClick={onViewProfile}
            className="text-sm text-[#1a365d] font-medium tracking-wide hover:underline decoration-2 underline-offset-4 py-2"
          >
            View My Profile
          </button>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { AuthTitleBlock } from './shared/AuthTitleBlock';
import { OtpInputGroup } from './fields/OtpInputGroup';
import { PrimaryButton } from './shared/PrimaryButton';
import { HotelLogo } from './shared/HotelLogo';
import { useOtpTimer } from '../hooks/useOtpTimer';

export type StepOtpVerificationProps = {
  mobile: string;
  maskedMobile: string;
  resendAfter?: number; // seconds
  isSubmitting: boolean;
  error?: string;
  onVerify: (otpCode: string) => void;
  onResend: () => void;
  onChangeMobile: () => void;
};

export function StepOtpVerification({
  maskedMobile,
  resendAfter = 60,
  isSubmitting,
  error: serverError,
  onVerify,
  onResend,
  onChangeMobile,
}: StepOtpVerificationProps) {
  const [otp, setOtp] = useState('');
  const { formattedTime, isFinished, reset } = useOtpTimer(resendAfter);

  // Auto-start timer on mount
  useEffect(() => {
    reset();
  }, [reset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerify(otp);
    }
  };

  const handleResend = () => {
    if (isFinished && !isSubmitting) {
      setOtp(''); // clear current input
      reset();
      onResend();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 h-full sm:h-auto">
      <div className="flex-1 flex flex-col pt-4 sm:pt-0 items-center sm:items-start text-center sm:text-left">
        <HotelLogo iconSize={48} showText={false} className="mb-6" />

        <AuthTitleBlock 
          title="Verify your number" 
          subtitle={`We've sent a 6-digit code to ${maskedMobile}`}
          align="left"
        />

        <div className="mt-4 mb-8 w-full">
          <OtpInputGroup
            length={6}
            value={otp}
            onChange={setOtp}
            error={serverError}
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        {/* OTP Helper Row */}
        <div className="w-full flex flex-row items-center justify-between text-sm px-1 mb-8">
          <p className="text-gray-500 font-medium">
            {!isFinished ? (
              <span>Code expires in {formattedTime}</span>
            ) : (
              <span className="text-gray-400">Code expired</span>
            )}
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={!isFinished || isSubmitting}
            className={`font-semibold underline underline-offset-4 decoration-2 transition-all ${
              isFinished && !isSubmitting 
                ? 'text-[#1a365d] decoration-[#1a365d]/30 hover:decoration-[#1a365d]' 
                : 'text-gray-300 decoration-transparent cursor-not-allowed'
            }`}
          >
            Resend OTP
          </button>
        </div>
      </div>

      <div className="mt-auto sm:mt-8 flex flex-col gap-4">
        <PrimaryButton 
          type="submit" 
          label="Verify OTP" 
          loading={isSubmitting}
          disabled={otp.length !== 6 || isSubmitting}
        />
        
        <button
          type="button"
          onClick={onChangeMobile}
          disabled={isSubmitting}
          className="text-sm text-gray-500 font-medium tracking-wide hover:text-gray-900 transition-colors mx-auto p-2"
        >
          Change Mobile Number
        </button>
      </div>
    </form>
  );
}

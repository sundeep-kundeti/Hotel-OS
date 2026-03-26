import React, { useState } from 'react';
import { AuthTitleBlock } from './shared/AuthTitleBlock';
import { MobileNumberField } from './fields/MobileNumberField';
import { PrimaryButton } from './shared/PrimaryButton';
import { HotelLogo } from './shared/HotelLogo';
import { mobileSchema } from '../schemas/signup.schemas';
import { z } from 'zod';

export type StepMobileEntryProps = {
  defaultCountryCode?: string;
  initialMobile?: string;
  isSubmitting: boolean;
  error?: string;
  onSubmit: (payload: { mobile: string; countryCode: string }) => void;
  socialLoginEnabled?: boolean;
};

export function StepMobileEntry({
  defaultCountryCode = '+91',
  initialMobile = '',
  isSubmitting,
  error: serverError,
  onSubmit,
}: StepMobileEntryProps) {
  const [mobile, setMobile] = useState(initialMobile);
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [validationError, setValidationError] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(undefined);

    try {
      mobileSchema.parse({ countryCode, mobile });
      onSubmit({ mobile, countryCode });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const zodErr = err as unknown as { errors: Array<{ message: string }> };
        setValidationError(zodErr.errors[0]?.message || 'Invalid mobile number');
      }
    }
  };

  const isComplete = mobile.length === 10;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 h-full sm:h-auto">
      <div className="flex-1 flex flex-col pt-4 sm:pt-0">
        <div className="flex flex-col items-center sm:items-start mb-8 gap-3">
          <HotelLogo iconSize={60} />
        </div>
        
        <AuthTitleBlock 
          title="Enter your mobile number" 
          subtitle="We'll send you a verification code to securely access or create your profile."
        />

        <div className="mt-2 mb-8">
          <MobileNumberField
            value={mobile}
            countryCode={countryCode}
            onChange={(val) => {
              setMobile(val);
              if (validationError) setValidationError(undefined);
            }}
            error={validationError || serverError}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="mt-auto sm:mt-8 flex flex-col gap-4">
        <PrimaryButton 
          type="submit" 
          label="Send Verification Code" 
          loading={isSubmitting}
          disabled={!isComplete}
        />
        
        <p className="text-center text-[11px] sm:text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-[#1a365d] hover:underline font-medium">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-[#1a365d] hover:underline font-medium">Privacy Policy</a>.
        </p>
      </div>
    </form>
  );
}

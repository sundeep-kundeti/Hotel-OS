import React, { useState, useEffect } from 'react';
import { SignupFlowState, SignupFlowContainerProps, SignupProfileFormValues } from '../types/signup.types';
import { SignupCard } from './SignupCard';
import { SignupProgressHeader } from './SignupProgressHeader';
import { StepMobileEntry } from './StepMobileEntry';
import { StepOtpVerification } from './StepOtpVerification';
import { StepProfileCompletion } from './StepProfileCompletion';
import { StepSignupSuccess } from './StepSignupSuccess';

const initialState: SignupFlowState = {
  step: 'mobile',
  mobile: '',
  maskedMobile: '',
  countryCode: '+91',
  profileCompleted: false,
  isLoading: false,
};

export function SignupFlowContainer({ initialSource }: SignupFlowContainerProps) {
  const [state, setState] = useState<SignupFlowState>(initialState);

  // Store UTM/Source params on mount (mock logic)
  useEffect(() => {
    if (initialSource) {
      console.log('Tracking source details for signup:', initialSource);
    }
  }, [initialSource]);

  const updateState = (updates: Partial<SignupFlowState>) => {
    setState(prev => ({ ...prev, ...updates, error: undefined })); // clear error on state change
  };

  const setError = (error: string) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  };

  // ---------------------------------------------------------------------------
  // MOCK API SIMULATIONS
  // ---------------------------------------------------------------------------

  const handleSendOtp = async ({ mobile, countryCode }: { mobile: string, countryCode: string }) => {
    updateState({ isLoading: true, mobile, countryCode });
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000));

    // Mock response logic
    if (mobile === '0000000000') {
      setError('Unable to send OTP right now.');
      return;
    }

    const masked = `${countryCode} ******${mobile.slice(-4)}`;
    updateState({ 
      isLoading: false, 
      step: 'otp',
      maskedMobile: masked,
      resendAfter: 60,
    });
  };

  const handleVerifyOtp = async (otpCode: string) => {
    updateState({ isLoading: true });
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200));

    // Mock response logic
    if (otpCode !== '123456') {
      setError('Invalid OTP code. Try 123456 for the demo.');
      return;
    }

    // Determine next step (New User vs Existing Completed Profile)
    // For demo, we assume New User always goes to Profile.
    updateState({ 
      isLoading: false, 
      step: 'profile',
      signupToken: 'temp_token_123',
      profileCompleted: false
    });
  };

  const handleResendOtp = async () => {
    updateState({ isLoading: true });
    await new Promise(r => setTimeout(r, 800));
    updateState({ isLoading: false });
    // Token sent notification could be shown here
  };

  const handleCompleteProfile = async (values: SignupProfileFormValues) => {
    updateState({ isLoading: true });
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));

    updateState({ 
      isLoading: false,
      step: 'success',
      profileCompleted: true,
      guest: {
        guestId: 'g_12345',
        guestCode: 'GUEST-123',
        fullName: values.fullName,
      },
      wallet: {
        availablePoints: 500,
        tierCode: 'SILVER',
      },
      offers: [
        { offerCode: 'WELCOME10', offerType: 'discount', validUntil: '2026-12-31' }
      ]
    });
  };

  const handleContinueToBooking = () => {
    // In actual implementation, redirect using Next Router
    console.log("Redirecting to /booking... Guest ID:", state.guest?.guestId);
    window.location.href = '/'; // Go back to home for now
  };

  // ---------------------------------------------------------------------------
  // RENDER HELPERS
  // ---------------------------------------------------------------------------

  const onChangeMobile = () => {
    updateState({ step: 'mobile', error: undefined });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 sm:bg-white sm:py-12 flex flex-col justify-center animate-in fade-in duration-500">
      <SignupCard>
        {/* Progress Header isn't shown on the very first mobile entry step to keep it clean */}
        {state.step !== 'mobile' && (
          <div className="mb-6 -mt-4">
            <SignupProgressHeader currentStep={state.step} />
          </div>
        )}

        {/* Step Routing */}
        {state.step === 'mobile' && (
          <StepMobileEntry
            defaultCountryCode={state.countryCode}
            initialMobile={state.mobile}
            isSubmitting={state.isLoading}
            error={state.error}
            onSubmit={handleSendOtp}
          />
        )}

        {state.step === 'otp' && (
          <StepOtpVerification
            mobile={state.mobile}
            maskedMobile={state.maskedMobile}
            resendAfter={state.resendAfter}
            isSubmitting={state.isLoading}
            error={state.error}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            onChangeMobile={onChangeMobile}
          />
        )}

        {state.step === 'profile' && (
          <StepProfileCompletion
            initialValues={{ 
              referralCode: initialSource?.referralCode 
            }}
            referralLocked={!!initialSource?.referralCode}
            isSubmitting={state.isLoading}
            error={state.error}
            onSubmit={handleCompleteProfile}
          />
        )}

        {state.step === 'success' && (
          <StepSignupSuccess
            guestName={state.guest?.fullName || 'Guest'}
            wallet={state.wallet}
            offers={state.offers}
            onContinueToBooking={handleContinueToBooking}
            onViewProfile={() => console.log('View Profile clicked')}
          />
        )}
      </SignupCard>
    </div>
  );
}

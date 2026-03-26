import React, { useState } from 'react';
import { z } from 'zod';
import { AuthTitleBlock } from './shared/AuthTitleBlock';
import { PrimaryButton } from './shared/PrimaryButton';
import { TextField } from './fields/TextField';
import { DateField } from './fields/DateField';
import { CheckboxField } from './fields/CheckboxField';
import { SignupProfileFormValues } from '../types/signup.types';
import { profileSchema } from '../schemas/signup.schemas';

export type StepProfileCompletionProps = {
  initialValues?: Partial<SignupProfileFormValues>;
  isSubmitting: boolean;
  error?: string;
  referralLocked?: boolean;
  onSubmit: (values: SignupProfileFormValues) => void;
};

const DEFAULT_VALUES: SignupProfileFormValues = {
  fullName: '',
  email: '',
  dateOfBirth: '',
  anniversaryDate: '',
  city: '',
  referralCode: '',
  consents: {
    terms: false,
    privacy: false,
    promoWhatsapp: true,
    promoSms: false,
    promoEmail: true,
    transactionalWhatsapp: true,
    transactionalSms: true,
  },
};

export function StepProfileCompletion({
  initialValues,
  isSubmitting,
  error: serverError,
  referralLocked = false,
  onSubmit,
}: StepProfileCompletionProps) {
  const [values, setValues] = useState<SignupProfileFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
    consents: { ...DEFAULT_VALUES.consents, ...(initialValues?.consents || {}) }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof SignupProfileFormValues, value: string | boolean) => {
    setValues((prev: SignupProfileFormValues) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field as string]: '' }));
    }
  };

  const updateConsent = (field: keyof SignupProfileFormValues['consents'], value: boolean) => {
    setValues((prev: SignupProfileFormValues) => ({
      ...prev,
      consents: { ...prev.consents, [field]: value }
    }));
    // Clear errors for terms/privacy if checked
    if (field === 'terms' && value && errors['consents.terms']) {
      setErrors((prev: Record<string, string>) => ({ ...prev, 'consents.terms': '' }));
    }
    if (field === 'privacy' && value && errors['consents.privacy']) {
      setErrors((prev: Record<string, string>) => ({ ...prev, 'consents.privacy': '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = profileSchema.parse(values);
      onSubmit(validated as SignupProfileFormValues);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        const zodErr = err as unknown as { errors: Array<{ path: string[], message: string }> };
        zodErr.errors.forEach((e) => {
          const path = e.path.join('.');
          newErrors[path] = e.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 h-full sm:h-auto overflow-y-auto no-scrollbar pb-6">
      
      <AuthTitleBlock 
        title="Complete your profile" 
        subtitle="Help us personalize your stays and rewards."
        align="left"
      />

      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-5 bg-white sm:bg-transparent -mx-6 px-6 sm:mx-0 sm:px-0">
        <TextField
          label="Full Name"
          value={values.fullName}
          onChange={(v) => updateField('fullName', v)}
          placeholder="Enter your full name"
          required
          error={errors.fullName}
          disabled={isSubmitting}
        />

        <TextField
          label="Email Address"
          type="email"
          value={values.email}
          onChange={(v) => updateField('email', v)}
          placeholder="Enter email address"
          error={errors.email}
          disabled={isSubmitting}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <DateField
            label="Date of Birth"
            value={values.dateOfBirth}
            onChange={(v) => updateField('dateOfBirth', v)}
            helperText="Used for birthday offers"
            error={errors.dateOfBirth}
            disabled={isSubmitting}
          />

          <DateField
            label="Anniversary Date"
            value={values.anniversaryDate}
            onChange={(v) => updateField('anniversaryDate', v)}
            helperText="Used for anniversary offers"
            error={errors.anniversaryDate}
            disabled={isSubmitting}
          />
        </div>

        <TextField
          label="City"
          value={values.city}
          onChange={(v) => updateField('city', v)}
          placeholder="Enter city"
          error={errors.city}
          disabled={isSubmitting}
        />

        <TextField
          label="Referral Code"
          value={values.referralCode}
          onChange={(v) => updateField('referralCode', v.toUpperCase())}
          placeholder="Enter referral code"
          error={errors.referralCode}
          disabled={referralLocked || isSubmitting}
        />

        <div className="mt-4 mb-2 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Terms and Privacy</h3>
          <div className="flex flex-col gap-3">
            <CheckboxField
              checked={values.consents.terms}
              onChange={(v) => updateConsent('terms', v)}
              label={<>I agree to the <a href="/terms" className="text-[#1a365d] hover:underline" target="_blank" rel="noopener noreferrer">Terms of Service</a></>}
              error={errors['consents.terms']}
              disabled={isSubmitting}
            />
            <CheckboxField
              checked={values.consents.privacy}
              onChange={(v) => updateConsent('privacy', v)}
              label={<>I agree to the <a href="/privacy" className="text-[#1a365d] hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></>}
              error={errors['consents.privacy']}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="mb-6 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Communication Preferences</h3>
          <div className="flex flex-col gap-3">
            <CheckboxField
              checked={values.consents.transactionalWhatsapp}
              onChange={(v) => updateConsent('transactionalWhatsapp', v)}
              label={<span className="text-gray-600">Send booking updates on WhatsApp</span>}
              disabled={isSubmitting}
            />
            <CheckboxField
              checked={values.consents.promoWhatsapp}
              onChange={(v) => updateConsent('promoWhatsapp', v)}
              label={<span className="text-gray-600">Send promotional offers on WhatsApp</span>}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="mt-auto sm:mt-10 pt-4 pb-2 bg-white sticky sm:static bottom-0 border-t sm:border-transparent border-gray-100 -mx-6 px-6 sm:mx-0 sm:px-0">
        <PrimaryButton 
          type="submit" 
          label={isSubmitting ? "Creating Account..." : "Create Account"} 
          loading={isSubmitting}
          disabled={isSubmitting || !values.fullName || !values.consents.terms || !values.consents.privacy}
        />
      </div>
    </form>
  );
}

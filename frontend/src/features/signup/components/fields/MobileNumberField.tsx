import React from 'react';
import { cn } from '../../utils/tailwind';
import { InlineError } from '../shared/InlineError';
import { FormHelperText } from '../shared/FormHelperText';

export type MobileNumberFieldProps = {
  value: string;
  countryCode?: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
};

export function MobileNumberField({
  value,
  countryCode = '+91',
  onChange,
  error,
  helperText,
  disabled,
}: MobileNumberFieldProps) {
  const id = React.useId();

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const cleaned = e.target.value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      onChange(cleaned);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1.5 flex justify-between">
        <span>Phone number</span>
      </label>
      
      <div className={cn(
        "flex w-full rounded-xl overflow-hidden border bg-white transition-colors focus-within:ring-1",
        error 
          ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500" 
          : "border-gray-300 focus-within:border-[var(--color-hotel-gold)] focus-within:ring-[var(--color-hotel-gold)]",
        disabled && "bg-gray-50 opacity-80"
      )}>
        <div className="flex items-center justify-center px-3 bg-gray-50 border-r border-gray-200 text-gray-600 font-medium sm:text-sm select-none">
          {countryCode}
        </div>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={value}
          onChange={handlePhoneInput}
          disabled={disabled}
          placeholder="Enter mobile number"
          className="flex-1 w-full bg-transparent px-4 py-3 sm:text-sm outline-none placeholder-gray-400"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        />
      </div>

      {error ? (
        <div id={`${id}-error`}><InlineError message={error} /></div>
      ) : helperText ? (
        <div id={`${id}-helper`}><FormHelperText text={helperText} /></div>
      ) : null}
    </div>
  );
}

import React from 'react';
import { cn } from '../../utils/tailwind';
import { InlineError } from '../shared/InlineError';
import { FormHelperText } from '../shared/FormHelperText';

export type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  type?: 'text' | 'email';
  name?: string;
};

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required,
  disabled,
  maxLength,
  type = 'text',
  name,
}: TextFieldProps) {
  const id = React.useId();

  return (
    <div className="flex flex-col w-full">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1.5 flex justify-between">
        <span>
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-xl border bg-white px-4 py-3 sm:text-sm transition-colors outline-none',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
            : 'border-gray-300 focus:border-[var(--color-hotel-gold)] focus:ring-1 focus:ring-[var(--color-hotel-gold)]',
          disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed'
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
      />
      {error && (
        <div id={`${id}-error`}>
          <InlineError message={error} />
        </div>
      )}
      {!error && helperText && (
        <div id={`${id}-helper`}>
          <FormHelperText text={helperText} />
        </div>
      )}
    </div>
  );
}

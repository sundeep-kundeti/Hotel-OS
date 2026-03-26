import React, { useRef } from 'react';
import { cn } from '../../utils/tailwind';
import { InlineError } from '../shared/InlineError';

export type OtpInputGroupProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

export function OtpInputGroup({
  length = 6,
  value,
  onChange,
  error,
  disabled = false,
  autoFocus = false,
}: OtpInputGroupProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Safety: sync the visual state with the exact length of string.
  const digits = value.split('').slice(0, length);
  const paddedDigits = [...digits, ...Array(length - digits.length).fill('')];

  const triggerChange = (newDigits: string[]) => {
    onChange(newDigits.join(''));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/\D/g, ''); // Ensure only numbers
    if (!val) return; // Handled by standard flow or backspace

    const newDigits = [...paddedDigits];
    newDigits[index] = val.charAt(val.length - 1); // Take last character if multiple
    triggerChange(newDigits);

    // Auto focus next
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...paddedDigits];
      
      if (newDigits[index]) {
        // Clear current
        newDigits[index] = '';
        triggerChange(newDigits);
      } else if (index > 0) {
        // Clear previous and focus it
        newDigits[index - 1] = '';
        triggerChange(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pastedData) return;

    onChange(pastedData);
    
    // Focus the next empty slot or the last input
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex gap-2 sm:gap-3 w-full justify-between" onPaste={handlePaste}>
        {paddedDigits.map((char, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={2} // Allow 2 to catch rapid typing, we slice in handleChange
            value={char}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            className={cn(
              "w-full aspect-square text-center text-xl sm:text-2xl font-semibold rounded-xl border bg-white outline-none transition-all",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-600"
                : "border-gray-300 focus:border-[var(--color-hotel-gold)] focus:ring-1 focus:ring-[var(--color-hotel-gold)] text-gray-900",
              disabled && "bg-gray-50 opacity-70 cursor-not-allowed"
            )}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={!!error}
          />
        ))}
      </div>
      {error && (
        <div className="mt-2 w-full text-center">
          <InlineError message={error} />
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { cn } from '../../utils/tailwind';
import { InlineError } from '../shared/InlineError';

export type CheckboxFieldProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  error?: string;
  disabled?: boolean;
  id?: string;
};

export function CheckboxField({
  checked,
  onChange,
  label,
  error,
  disabled = false,
  id: providedId,
}: CheckboxFieldProps) {
  const generatedId = React.useId();
  const id = providedId || generatedId;

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className={cn(
               "w-4 h-4 rounded mt-0.5",
               "text-[#1a365d] border-gray-300 focus:ring-[#1a365d] focus:ring-2",
               disabled && "opacity-50 cursor-not-allowed bg-gray-100"
            )}
            aria-invalid={!!error}
          />
        </div>
        <div className="ml-3 text-sm">
          <label 
            htmlFor={id} 
            className={cn(
              "font-medium",
              error ? "text-red-700" : "text-gray-700",
              disabled && "opacity-60 cursor-not-allowed"
            )}
          >
            {label}
          </label>
        </div>
      </div>
      {error && (
        <div className="ml-7 mt-1">
          <InlineError message={error} />
        </div>
      )}
    </div>
  );
}

import { cn } from '../../utils/tailwind';

export type PrimaryButtonProps = {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
};

export function PrimaryButton({
  label,
  onClick,
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = true,
  className,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'relative flex justify-center items-center py-3 px-4 rounded-xl font-medium transition-colors text-sm',
        fullWidth ? 'w-full' : 'w-auto',
        isDisabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          : 'bg-[var(--color-hotel-gold)] text-[var(--color-hotel-blue)] hover:brightness-105 shadow-sm active:scale-[0.98]',
        className
      )}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="opacity-90">{label}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}

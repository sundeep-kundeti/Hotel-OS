import React from 'react';
import { cn } from '../utils/tailwind';

export type SignupCardProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function SignupCard({ children, footer, className }: SignupCardProps) {
  return (
    <div className={cn(
      "w-full max-w-[460px] mx-auto bg-white sm:rounded-3xl sm:shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col min-h-[100dvh] sm:min-h-0 relative",
      className
    )}>
      {/* Background elegant pattern (optional) */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-hotel-gold)] opacity-[0.03] rounded-bl-full pointer-events-none" />
      
      <div className="flex-1 flex flex-col p-6 sm:p-10 relative z-10">
        {children}
      </div>

      {footer && (
        <div className="p-6 sm:p-8 bg-gray-50/80 border-t border-gray-100 mt-auto relative z-10">
          {footer}
        </div>
      )}
    </div>
  );
}

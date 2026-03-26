import React from 'react';
import { cn } from '../utils/tailwind';
import { SignupStep } from '../types/signup.types';

export type SignupProgressHeaderProps = {
  currentStep: SignupStep;
};

export function SignupProgressHeader({ currentStep }: SignupProgressHeaderProps) {
  // Map our 4 internal steps to 3 progress phases for the guest
  // 1: Verify (mobile, otp), 2: Profile, 3: Success
  let activePhase = 1;
  if (currentStep === 'profile') activePhase = 2;
  if (currentStep === 'success') activePhase = 3;

  const phases = [
    { id: 1, label: 'Verify' },
    { id: 2, label: 'Details' },
    { id: 3, label: 'Ready' },
  ];

  return (
    <div className="w-full flex items-center justify-center py-4 px-6 relative z-10">
      <div className="flex items-center gap-2 max-w-[280px] w-full">
        {phases.map((phase, index) => {
          const isCompleted = phase.id < activePhase;
          const isActive = phase.id === activePhase;
          
          return (
            <React.Fragment key={phase.id}>
              {/* Dot and Label */}
              <div className="flex flex-col items-center gap-1.5 relative">
                <div 
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    isCompleted ? "bg-[#1a365d] text-white" : 
                    isActive ? "bg-[var(--color-hotel-gold)] text-[#1a365d] ring-4 ring-[var(--color-hotel-gold)]/20 shadow-sm" : 
                    "bg-gray-200 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5 stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    phase.id
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium tracking-wide uppercase absolute -bottom-4 whitespace-nowrap",
                  isActive ? "text-[#1a365d]" : "text-gray-400"
                )}>
                  {phase.label}
                </span>
              </div>
              
              {/* Connecting Line */}
              {index < phases.length - 1 && (
                <div className="flex-1 h-[2px] rounded-full overflow-hidden bg-gray-200">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500 ease-out",
                      phase.id < activePhase ? "bg-[#1a365d] w-full" : "bg-transparent w-0"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

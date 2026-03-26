import React from 'react';
import { cn } from '../../utils/tailwind';

export type HotelLogoProps = {
  className?: string;
  iconSize?: number;
  showText?: boolean;
};

export function HotelLogo({ className, iconSize = 64, showText = true }: HotelLogoProps) {
  return (
    <div className={cn("inline-flex flex-col items-center justify-center text-[var(--color-hotel-gold)]", className)}>
      <svg 
        width={iconSize * 1.6} 
        height={iconSize} 
        viewBox="0 0 200 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        <g fill="currentColor">
          {/* Left Pillar Thick */}
          <rect x="52" y="20" width="8" height="80" />
          {/* Left Pillar Thin (Inner) */}
          <rect x="68" y="32" width="2" height="68" />
          {/* Left Pillar Slanted Top */}
          <polygon points="52,20 70,32 68,34 52,23" />
          {/* Left Foundation Base */}
          <rect x="25" y="98" width="35" height="2" />
          
          {/* Right Pillar Thick */}
          <rect x="140" y="20" width="8" height="80" />
          {/* Right Pillar Thin (Inner) */}
          <rect x="130" y="32" width="2" height="68" />
          {/* Right Pillar Slanted Top */}
          <polygon points="148,20 130,32 132,34 148,23" />
          {/* Right Foundation Base */}
          <rect x="140" y="98" width="35" height="2" />
          
          {/* Center M/V Shape Connecting the thin pillars */}
          <polygon points="68,55 100,85 132,55 132,58 100,89 68,58" />
          
          {/* Full Bottom Base Line */}
          <rect x="15" y="112" width="170" height="3" />
        </g>
      </svg>
      {showText && (
        <div className="font-serif font-bold tracking-widest text-[#fbbf24] mt-2 select-none" style={{ fontSize: `${iconSize * 0.4}px`, lineHeight: 1 }}>
          SRIMUNI
        </div>
      )}
    </div>
  );
}

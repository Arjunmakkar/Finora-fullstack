import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="6" y="4" width="7" height="24" rx="3.5" fill="url(#finora-teal)" />
      <rect x="15" y="4" width="13" height="7" rx="3.5" fill="url(#finora-cyan)" />
      <rect x="15" y="14" width="9" height="7" rx="3.5" fill="url(#finora-cyan)" opacity="0.85" />
      <defs>
        <linearGradient id="finora-teal" x1="6" y1="4" x2="6" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4b4" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="finora-cyan" x1="15" y1="4" x2="28" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#00d4b4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

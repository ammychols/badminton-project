import React from 'react';

export function AppIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* App icon background */}
      <rect width="80" height="80" rx="20" fill="#111827"/>

      {/* Shuttlecock feather lines */}
      <line x1="40" y1="58" x2="17" y2="24" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="40" y1="58" x2="23" y2="20" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="40" y1="58" x2="30" y2="18" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="40" y1="58" x2="37" y2="17" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="40" y1="58" x2="44" y2="17" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="40" y1="58" x2="51" y2="18" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="40" y1="58" x2="58" y2="20" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="40" y1="58" x2="64" y2="24" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>

      {/* Feather ring */}
      <ellipse cx="40.5" cy="21" rx="23.5" ry="5.5" stroke="white" strokeWidth="1.4" fill="none"/>

      {/* Cork base */}
      <ellipse cx="40" cy="61" rx="6.5" ry="4" fill="#4ade80"/>
      <ellipse cx="40" cy="58.5" rx="4" ry="2.5" fill="white"/>
    </svg>
  );
}

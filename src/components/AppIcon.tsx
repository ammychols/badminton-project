import React from 'react';

export function AppIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="#0f172a"/>

      {/* Cork base */}
      <ellipse cx="40" cy="62" rx="7" ry="4" fill="white"/>
      <path d="M33 62 Q33 68 40 69 Q47 68 47 62" fill="white"/>

      {/* Band between cork and feathers */}
      <rect x="33" y="54" width="14" height="3" rx="1.5" fill="white" opacity="0.9"/>

      {/* Feather shafts - 5 lines from band center up to top ring */}
      <line x1="40" y1="54" x2="22" y2="18" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.85"/>
      <line x1="40" y1="54" x2="31" y2="16" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.85"/>
      <line x1="40" y1="54" x2="40" y2="15" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.85"/>
      <line x1="40" y1="54" x2="49" y2="16" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.85"/>
      <line x1="40" y1="54" x2="58" y2="18" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.85"/>

      {/* Horizontal rings connecting feathers */}
      <path d="M25.5 42 Q32 38 40 37.5 Q48 38 54.5 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.75"/>
      <path d="M22.5 28 Q31 23 40 22.5 Q49 23 57.5 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.75"/>

      {/* Top open ring */}
      <ellipse cx="40" cy="17" rx="18" ry="4" stroke="white" strokeWidth="2" fill="none"/>
    </svg>
  );
}

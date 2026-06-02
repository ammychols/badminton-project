import React from 'react';

export function AppIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="18" fill="#0f172a"/>

      {/* 7 feather lines converging to base */}
      <line x1="40" y1="56" x2="22" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="40" y1="56" x2="27" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="40" y1="56" x2="33.5" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="40" y1="56" x2="40" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="40" y1="56" x2="46.5" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="40" y1="56" x2="53" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="40" y1="56" x2="58" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Crown ring */}
      <ellipse cx="40" cy="19" rx="18" ry="5" stroke="white" strokeWidth="1.8" fill="none"/>

      {/* Cork dome */}
      <path d="M33 54 Q33 65 40 66 Q47 65 47 54" fill="white"/>
      <ellipse cx="40" cy="54" rx="7" ry="2.5" fill="#4ade80"/>
    </svg>
  );
}

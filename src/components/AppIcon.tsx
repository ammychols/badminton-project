import React from 'react';

export function AppIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="22" fill="#1a2035"/>

      {/* Cork — round base */}
      <circle cx="40" cy="63" r="5.5" fill="white"/>

      {/* Neck band */}
      <rect x="35" y="54" width="10" height="5" rx="2" fill="white"/>

      {/* Feather cage outline — clean cone */}
      <path d="M35 54 L18 20 Q40 14 62 20 L45 54 Z"
        fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round"/>

      {/* Top open rim */}
      <ellipse cx="40" cy="20" rx="22" ry="5" stroke="white" strokeWidth="2" fill="none"/>

      {/* 3 clean feather shaft lines */}
      <line x1="40" y1="54" x2="40" y2="15" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
      <line x1="40" y1="54" x2="27" y2="16" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
      <line x1="40" y1="54" x2="53" y2="16" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>

      {/* One mid ring */}
      <path d="M23 37 Q40 31 57 37" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  );
}

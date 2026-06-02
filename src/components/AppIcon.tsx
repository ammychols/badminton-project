import React from 'react';

export function AppIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="22" fill="#111827"/>

      {/* Racket head - clean oval outline */}
      <ellipse cx="38" cy="30" rx="15" ry="17" stroke="white" strokeWidth="2.2" fill="none"/>

      {/* String cross lines - horizontal */}
      <line x1="24" y1="27" x2="52" y2="27" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
      <line x1="23" y1="33" x2="53" y2="33" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>

      {/* String cross lines - vertical */}
      <line x1="33" y1="14" x2="33" y2="47" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
      <line x1="38" y1="13" x2="38" y2="47" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
      <line x1="43" y1="14" x2="43" y2="47" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>

      {/* Handle - tapered */}
      <path d="M35 47 L32 65 Q38 67 44 65 L41 47" fill="none" stroke="white" strokeWidth="2.2" strokeLinejoin="round"/>

      {/* Grip wrap accent */}
      <line x1="33" y1="57" x2="43" y2="57" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="33" y1="61" x2="43" y2="61" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

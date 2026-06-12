import React from 'react';

export function AppIcon({ size = 80 }: { size?: number }) {
  const hLines = [-12, -7, -2, 3, 8, 13].map(dy => 29 + dy);
  const vLines = [-9, -4, 1, 6, 11].map(dx => 31 + dx);

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-bg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8c7cf9"/>
          <stop offset="100%" stopColor="#ef2cc1"/>
        </linearGradient>
        <radialGradient id="ai-glow" cx="25%" cy="25%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
        <clipPath id="ai-head-clip">
          <ellipse cx="31" cy="29" rx="13" ry="17"/>
        </clipPath>
      </defs>

      {/* Background */}
      <rect width="80" height="80" rx="18" fill="url(#ai-bg)"/>
      {/* Subtle top-left glow */}
      <rect width="80" height="80" rx="18" fill="url(#ai-glow)"/>

      {/* Racket — rotated ~-18° around centre */}
      <g transform="rotate(-18, 40, 40)">
        {/* Head outline */}
        <ellipse cx="31" cy="29" rx="13" ry="17"
          stroke="white" strokeWidth="2.2" strokeOpacity="0.95"/>

        {/* String grid clipped to head */}
        <g clipPath="url(#ai-head-clip)" stroke="rgba(255,255,255,0.38)" strokeWidth="1.1">
          {hLines.map(y => <line key={`h${y}`} x1="16" y1={y} x2="46" y2={y}/>)}
          {vLines.map(x => <line key={`v${x}`} x1={x} y1="11" x2={x} y2="47"/>)}
        </g>

        {/* Throat */}
        <path d="M 24 46 Q 31 53 38 46"
          stroke="white" strokeWidth="2.2" strokeOpacity="0.9" fill="none"/>

        {/* Shaft */}
        <line x1="31" y1="53" x2="31" y2="67"
          stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.92"/>

        {/* Grip */}
        <rect x="28.5" y="63" width="5" height="8" rx="2"
          fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth="1.8" strokeOpacity="0.75"/>
      </g>

      {/* Shuttlecock — lower-right, cork pointing upper-right */}
      <g transform="translate(58, 56) rotate(-45)">
        {/* Cork dome */}
        <ellipse cx="0" cy="0" rx="5" ry="4"
          fill="white" fillOpacity="0.92"/>
        <ellipse cx="-0.5" cy="-1" rx="2.5" ry="1.5"
          fill="rgba(255,255,255,0.3)"/>

        {/* Feather struts */}
        {[-30, -15, 0, 15, 30].map((a, i) => {
          const rad = (a * Math.PI) / 180;
          const bx = Math.sin(rad) * 4;
          const by = 3.5;
          const tx = Math.sin(rad) * 8;
          const ty = 14;
          return (
            <line key={i} x1={bx} y1={by} x2={tx} y2={ty}
              stroke="white" strokeWidth="1.1" strokeOpacity="0.72" strokeLinecap="round"/>
          );
        })}

        {/* Feather rim */}
        <ellipse cx="0" cy="14" rx="8" ry="3"
          stroke="white" strokeWidth="1.3" strokeOpacity="0.72" fill="none"/>
      </g>
    </svg>
  );
}

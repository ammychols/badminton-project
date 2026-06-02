import React from 'react';

// Draws a vertical shuttlecock then rotates it to match the reference tilt
const PX = 40, PY = 36; // feather pivot
const ANGLES = [-28, -9, 9, 28];

function petal(angle: number) {
  const rad = (angle * Math.PI) / 180;
  // Tip of feather (30px from pivot)
  const tx = PX + Math.sin(rad) * 30;
  const ty = PY + Math.cos(rad) * 30;
  // Control points for wide rounded shape
  const lx = PX + Math.sin(rad - 0.38) * 18;
  const ly = PY + Math.cos(rad - 0.38) * 18;
  const rx = PX + Math.sin(rad + 0.38) * 18;
  const ry = PY + Math.cos(rad + 0.38) * 18;
  return `M ${PX} ${PY} Q ${lx.toFixed(1)} ${ly.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)} Q ${rx.toFixed(1)} ${ry.toFixed(1)} ${PX} ${PY}`;
}

export function AppIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="#1a2035"/>

      {/* Rotate everything ~35° clockwise to match reference tilt */}
      <g transform="rotate(35, 40, 40)">

        {/* Feathers — back to front */}
        {ANGLES.map((angle, i) => (
          <path key={i} d={petal(angle)}
            fill={i === 0 || i === 3 ? '#c8c8c8' : '#e8e8e8'}
            stroke="#1a2035" strokeWidth="2.2" strokeLinejoin="round"/>
        ))}

        {/* Collar stripes */}
        <rect x="35.5" y="31" width="9" height="3.5" rx="1.5" fill="#b0b0b0" stroke="#1a2035" strokeWidth="1.5"/>
        <rect x="35.5" y="27" width="9" height="5" rx="2.5" fill="#d8d8d8" stroke="#1a2035" strokeWidth="1.5"/>

        {/* Cork */}
        <circle cx="40" cy="19" r="9" fill="#f5c842" stroke="#1a2035" strokeWidth="2.2"/>
        {/* Shadow on cork */}
        <path d="M 32 22 Q 35 26 40 26 Q 45 26 48 22" fill="rgba(0,0,0,0.08)" stroke="none"/>
      </g>
    </svg>
  );
}

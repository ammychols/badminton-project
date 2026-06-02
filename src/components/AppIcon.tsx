import React from 'react';

// Draws vertical shuttlecock then rotates 38° CW so cork is top-right, feathers bottom-left
const CX = 40, CY = 40; // rotation center

function pt(angle: number, dist: number, ox = CX, oy = CY) {
  const r = (angle * Math.PI) / 180;
  return [ox + Math.sin(r) * dist, oy - Math.cos(r) * dist] as [number, number];
}

// 4 feather petals fanning downward (180° = straight down)
const FEATHER_ANGLES = [150, 163, 177, 191]; // pointing downward-ish, 4 feathers

function featherPath(angle: number): string {
  const [px, py] = pt(angle, 0, CX, CY + 4); // pivot slightly below center
  const [tx, ty] = pt(angle, 32, CX, CY + 4); // tip
  const [l1x, l1y] = pt(angle - 12, 18, CX, CY + 4);
  const [r1x, r1y] = pt(angle + 12, 18, CX, CY + 4);
  return `M ${px.toFixed(1)} ${py.toFixed(1)} Q ${l1x.toFixed(1)} ${l1y.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)} Q ${r1x.toFixed(1)} ${r1y.toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)} Z`;
}

export function AppIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="#1a2035"/>

      <g transform={`rotate(38, ${CX}, ${CY})`}>

        {/* Feathers — draw back feathers first (darker), front ones on top */}
        {FEATHER_ANGLES.map((angle, i) => (
          <path key={i} d={featherPath(angle)}
            fill={i < 2 ? '#d4d4d4' : '#efefef'}
            stroke="#1a2035" strokeWidth="2.5" strokeLinejoin="round"/>
        ))}

        {/* Collar — 3 horizontal stripes between cork and feathers */}
        <rect x="33" y="23" width="14" height="5"  rx="1" fill="#e2e2e2" stroke="#1a2035" strokeWidth="2"/>
        <rect x="34" y="29" width="12" height="4.5" rx="1" fill="#d0d0d0" stroke="#1a2035" strokeWidth="2"/>
        <rect x="35" y="34" width="10" height="4"  rx="1" fill="#c0c0c0" stroke="#1a2035" strokeWidth="2"/>

        {/* Cork circle */}
        <circle cx="40" cy="14" r="11" fill="#fdd663" stroke="#1a2035" strokeWidth="2.5"/>
        {/* Subtle highlight on cork */}
        <ellipse cx="37" cy="11" rx="4" ry="3" fill="rgba(255,255,255,0.25)" stroke="none"/>
      </g>
    </svg>
  );
}

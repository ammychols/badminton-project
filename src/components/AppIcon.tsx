import React from 'react';

const FEATHER_ANGLES = [-36, -18, 0, 18, 36];
const PX = 40, PY = 37; // feather pivot point

// Petal path: leaf shape going downward from pivot
const PETAL = `M ${PX} ${PY} C ${PX - 7} ${PY + 10} ${PX - 7} ${PY + 24} ${PX} ${PY + 30} C ${PX + 7} ${PY + 24} ${PX + 7} ${PY + 10} ${PX} ${PY}`;

export function AppIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="#1e2235"/>

      {/* ── Feather petals (back to front: outer to center) ── */}
      {FEATHER_ANGLES.map((angle, i) => (
        <g key={i} transform={`rotate(${angle}, ${PX}, ${PY})`}>
          <path d={PETAL} fill="#e8e8e8" stroke="#1e2235" strokeWidth="2.2" strokeLinejoin="round"/>
        </g>
      ))}

      {/* ── Center feather on top ── */}
      <path d={PETAL} fill="white" stroke="#1e2235" strokeWidth="2.2" strokeLinejoin="round"/>

      {/* ── Collar band ── */}
      <rect x="31" y="30" width="18" height="7" rx="3.5" fill="#d0d0d0" stroke="#1e2235" strokeWidth="2"/>

      {/* ── Cork dome ── */}
      {/* Base ellipse */}
      <ellipse cx="40" cy="30" rx="10" ry="3" fill="#f0c040" stroke="#1e2235" strokeWidth="2"/>
      {/* Dome */}
      <path d="M 30 30 Q 30 13 40 13 Q 50 13 50 30" fill="#f0c040" stroke="#1e2235" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}

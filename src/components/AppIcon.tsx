import React from 'react';

// Feather petal: wide leaf shape, extends downward from pivot (PX, PY)
const PX = 40, PY = 32;
const PETAL = `M ${PX} ${PY} C ${PX - 11} ${PY + 9} ${PX - 12} ${PY + 26} ${PX} ${PY + 34} C ${PX + 12} ${PY + 26} ${PX + 11} ${PY + 9} ${PX} ${PY}`;
const ANGLES = [-34, -17, 0, 17, 34];

export function AppIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="#1a2035"/>

      {/* Feather petals — outer ones first (darker), center on top */}
      {ANGLES.map((angle, i) => {
        const isCenter = i === 2;
        return (
          <g key={i} transform={`rotate(${angle}, ${PX}, ${PY})`}>
            <path
              d={PETAL}
              fill={isCenter ? '#f0f0f0' : '#d8d8d8'}
              stroke="#1a2035"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* Collar — two thin stripes */}
      <rect x="34" y="27" width="12" height="4" rx="2" fill="#c8c8c8" stroke="#1a2035" strokeWidth="1.5"/>
      <rect x="34" y="23" width="12" height="5" rx="2.5" fill="#e0e0e0" stroke="#1a2035" strokeWidth="1.5"/>

      {/* Cork — small golden dome */}
      <path d="M 32 23 Q 32 13 40 13 Q 48 13 48 23" fill="#f5c842" stroke="#1a2035" strokeWidth="2" strokeLinejoin="round"/>
      <ellipse cx="40" cy="23" rx="8" ry="2.5" fill="#f5c842" stroke="#1a2035" strokeWidth="1.5"/>
    </svg>
  );
}

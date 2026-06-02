import React from 'react';

export function AppIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="#1a2035"/>

      {/* ── Cork ── */}
      {/* Dome */}
      <path d="M34 66 Q34 73 40 73 Q46 73 46 66" fill="white"/>
      {/* Flat base of dome */}
      <ellipse cx="40" cy="66" rx="6" ry="2.2" fill="white"/>

      {/* ── Collar (band) ── */}
      <rect x="33" y="58" width="14" height="6" rx="3" fill="white"/>

      {/* ── Feather shafts: 7 lines from collar-top outward ── */}
      {/* Arranged in an arc: leftmost to rightmost */}
      <line x1="40" y1="58" x2="14" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="40" y1="58" x2="23" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="40" y1="58" x2="32" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="40" y1="58" x2="40" y2="9"  stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="40" y1="58" x2="48" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="40" y1="58" x2="57" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="40" y1="58" x2="66" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>

      {/* ── Outer feather edge: scalloped arc connecting all tips ── */}
      {/* Each bump = one feather tip */}
      <path
        d="M14 16
           Q17 10 23 12
           Q25  6 32 10
           Q34  4 40  9
           Q46  4 48 10
           Q55  6 57 12
           Q63 10 66 16"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        fill="none"/>

      {/* ── Horizontal ring at mid feather ── */}
      <path d="M21 37 Q40 30 59 37"
        stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.55"/>

      {/* ── Outer side edges of feather cage ── */}
      <line x1="40" y1="58" x2="14" y2="16" stroke="white" strokeWidth="0" />
      {/* Left cage edge */}
      <line x1="33" y1="58" x2="14" y2="16" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.4"/>
      {/* Right cage edge */}
      <line x1="47" y1="58" x2="66" y2="16" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

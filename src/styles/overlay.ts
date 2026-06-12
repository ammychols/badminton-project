// Single source of truth for overlay stacking + scrim.
// App chrome (header, bottom nav, user menu) lives at z-40..50, so every
// overlay must sit above that. Heights are ordered by how "interrupting"
// the surface is: a confirmation must always sit above the surface that
// spawned it, the lightbox above everything, toasts on top.
export const Z = {
  dropdown: 50,  // anchored menus (···, user menu)
  panel: 55,     // slide-over detail panels (scrim = panel, sheet = panel + 1)
  modal: 60,     // bottom-sheet / centered forms
  confirm: 70,   // confirmations — above whatever opened them
  lightbox: 80,  // full-screen media
  toast: 90,
} as const;

// One scrim for every overlay. Derived from --nav-bg (#010120) so the dim
// reads as "the app behind, darkened" rather than four different greys.
export const BACKDROP = 'rgba(1, 1, 32, 0.55)';
export const BACKDROP_LIGHTBOX = 'rgba(1, 1, 32, 0.85)';

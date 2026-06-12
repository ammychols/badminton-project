import { useEffect, useRef } from 'react';

// Reference-counted scroll lock so stacked overlays (e.g. a confirm over a
// panel) don't restore page scroll until the last one closes.
let openCount = 0;
let restoreOverflow = '';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Wires up the accessibility behaviour every modal/panel/dialog needs:
 *  - moves focus into the overlay on open, restores it to the trigger on close
 *  - traps Tab / Shift+Tab inside the overlay
 *  - closes on Escape
 *  - locks body scroll while open (reference-counted for nesting)
 *
 * Attach the returned ref to the overlay's panel element, and give that
 * element `tabIndex={-1}` so it can receive focus when it has no focusable child.
 */
export function useOverlay(onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep the latest onClose without re-running the effect each render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = containerRef.current;

    if (openCount === 0) {
      restoreOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    openCount++;

    // Move focus into the overlay (first focusable, else the panel itself).
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !node) return;
      const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter(el => el.offsetParent !== null);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) document.body.style.overflow = restoreOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return containerRef;
}

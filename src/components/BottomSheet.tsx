import React from 'react';
import { useOverlay } from '../hooks/useOverlay';
import { Z, BACKDROP } from '../styles/overlay';

interface BottomSheetProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Responsive focused-task surface: bottom sheet on mobile, centered modal on
// desktop. Used for every create/edit form. Accessibility (focus trap, Escape,
// scroll lock, focus restore) comes from useOverlay.
export function BottomSheet({ title, subtitle, onClose, children, footer }: BottomSheetProps) {
  const ref = useOverlay(onClose);

  return (
    <div
      className="fixed inset-0 flex items-end justify-center sm:items-center"
      style={{ zIndex: Z.modal, background: BACKDROP }}
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-slide-up focus:outline-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Dark header */}
        <div
          className="flex items-center justify-between gap-3 px-6 py-4 flex-shrink-0"
          style={{ backgroundColor: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)' }}
        >
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-white truncate">{title}</h3>
            {subtitle && <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors text-xl leading-none flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
          >×</button>
        </div>

        {/* Light body */}
        <div className="p-6 overflow-y-auto flex-1" style={{ backgroundColor: 'var(--app-bg)' }}>
          {children}
        </div>

        {footer && (
          <div className="px-6 pb-6 pt-3 flex-shrink-0" style={{ backgroundColor: 'var(--app-bg)', borderTop: '1px solid var(--card-border)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

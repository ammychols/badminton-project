import React from 'react';
import { useOverlay } from '../hooks/useOverlay';
import { Z, BACKDROP } from '../styles/overlay';

interface DetailPanelProps {
  title: string;
  subtitle?: string;
  /** Optional header-right slot (e.g. a "navigate" button). */
  action?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}

// The one surface for "show me more about what I clicked, without losing my
// place": full-screen on mobile, 480px right panel on desktop. Replaces the
// hand-rolled CourtPanel and the old full-screen GroupReviewModal so detail
// views look and behave identically everywhere.
export function DetailPanel({ title, subtitle, action, onClose, children }: DetailPanelProps) {
  const ref = useOverlay(onClose);

  return (
    <>
      <div
        className="fixed inset-0"
        style={{ zIndex: Z.panel, background: BACKDROP }}
        onClick={onClose}
      />
      <style>{`
        .detail-panel{position:fixed;inset:0;z-index:${Z.panel + 1};display:flex;flex-direction:column;animation:dp-up .26s ease-out}
        @keyframes dp-up{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @media(min-width:640px){
          .detail-panel{inset:0 0 0 auto;width:480px;box-shadow:-8px 0 32px rgba(0,0,0,.18);animation:dp-in .26s ease-out}
          @keyframes dp-in{from{transform:translateX(100%)}to{transform:translateX(0)}}
        }
        @media(prefers-reduced-motion:reduce){.detail-panel{animation:none}}
      `}</style>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="detail-panel focus:outline-none"
        style={{ backgroundColor: 'var(--app-bg)' }}
      >
        {/* Dark header */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ backgroundColor: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', paddingTop: 'max(12px, env(safe-area-inset-top))' }}
        >
          <button
            onClick={onClose}
            aria-label="ปิด"
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            {/* mobile (full-screen): back arrow — desktop (slide-over): X */}
            <svg className="sm:hidden" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            <svg className="hidden sm:block" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-base font-extrabold text-white truncate" style={{ letterSpacing: '-0.4px' }}>{title}</div>
            {subtitle && <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{subtitle}</div>}
          </div>
          {action}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

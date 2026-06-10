import React from 'react';

interface BottomSheetProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function BottomSheet({ title, onClose, children, footer }: BottomSheetProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-y-auto max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Dark header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ backgroundColor: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)' }}>
          <h3 className="text-base font-extrabold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors text-xl leading-none"
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

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
      <div className="rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-y-auto max-h-[90vh]" style={{ backgroundColor: 'var(--nav-bg)' }} onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-[var(--text-1)]">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors text-xl leading-none"
              style={{ backgroundColor: 'var(--chip-bg)', color: 'var(--text-4)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bar-i)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--chip-bg)')}
            >×</button>
          </div>
          {children}
        </div>
        {footer && (
          <div className="px-6 pb-6 pt-3 border-t border-[var(--nav-border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

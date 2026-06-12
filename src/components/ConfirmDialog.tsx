import React from 'react';
import { useOverlay } from '../hooks/useOverlay';
import { Z, BACKDROP } from '../styles/overlay';
import { btn } from '../styles/tokens';

interface ConfirmDialogProps {
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Replaces the three duplicated confirm dialogs (group delete, court delete,
// session delete). Focus lands on Cancel first — the safe default for a
// destructive action. Sits at Z.confirm so it's always above the surface
// that opened it.
export function ConfirmDialog({
  title, message, confirmLabel = 'ลบ', cancelLabel = 'ยกเลิก', onConfirm, onCancel,
}: ConfirmDialogProps) {
  const ref = useOverlay(onCancel);

  return (
    <div
      className="fixed inset-0 flex items-end justify-center sm:items-center"
      style={{ zIndex: Z.confirm, background: BACKDROP }}
      onClick={onCancel}
    >
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-5 animate-slide-up focus:outline-none"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-base font-semibold text-[var(--text-1)] mb-1">{title}</p>
        {message && <p className="text-sm text-[var(--text-3)] mb-5">{message}</p>}
        <div className="flex gap-2">
          <button onClick={onCancel} className={btn.cancel}>{cancelLabel}</button>
          <button onClick={onConfirm} className={btn.danger}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

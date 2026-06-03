import React from 'react';

interface BottomSheetProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function BottomSheet({ title, onClose, children, footer }: BottomSheetProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center sm:items-center">
      <div className="bg-[#fafcf8] rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-[#1a3329]">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e8f0e4] text-[#6b8070] hover:bg-[#dce8d8] transition-colors text-xl leading-none"
            >×</button>
          </div>
          {children}
        </div>
        {footer && (
          <div className="px-6 pb-6 pt-3 border-t border-[#e2e8dd]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

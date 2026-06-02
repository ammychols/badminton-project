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
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors text-xl leading-none"
            >×</button>
          </div>
          {children}
        </div>
        {footer && (
          <div className="px-6 pb-6 pt-3 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

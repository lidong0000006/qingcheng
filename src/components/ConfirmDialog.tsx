import React from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({ title, message, confirmText = '确认', cancelText = '取消', onConfirm, onCancel, danger }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-3xl p-8 w-[90%] max-w-[360px] shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-8">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-full bg-gray-100 text-gray-700 font-semibold active:scale-95 transition-transform">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`flex-1 py-3 rounded-full font-semibold active:scale-95 transition-transform text-white ${danger ? 'bg-red-500' : 'bg-gradient-to-br from-primary to-primary-light'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

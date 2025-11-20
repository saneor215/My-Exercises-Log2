
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string | null;
  confirmButtonClass?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  children, 
  confirmText, 
  cancelText,
  confirmButtonClass 
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="text-gray-300 mb-6">
          {children}
        </div>
        <div className="flex justify-end gap-4">
          {cancelText !== null && (
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {cancelText || t('cancel')}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors focus:outline-none focus:ring-2 ${confirmButtonClass ? confirmButtonClass : 'bg-red-600 hover:bg-red-500 focus:ring-red-400'}`}
          >
            {confirmText || t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

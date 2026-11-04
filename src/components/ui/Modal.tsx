'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, subtitle, children }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog content */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-2xl p-6 sm:p-8 z-10 transition-all">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-800/60">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-950 dark:text-emerald-100">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-xl p-1.5 text-stone-400 hover:text-stone-700 dark:text-emerald-400 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}


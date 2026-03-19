'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Close icon
// ─────────────────────────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Size classes
// ─────────────────────────────────────────────────────────────────────────────

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  className,
}) => {
  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const portal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-slate-900/60 backdrop-blur-[4px]',
          'animate-[fadeIn_0.2s_ease-out]',
        )}
        aria-hidden="true"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Content */}
      <div
        className={cn(
          'relative w-full flex flex-col',
          'bg-white dark:bg-slate-900',
          'rounded-[var(--radius-lg)] shadow-xl',
          'animate-[scaleIn_0.25s_ease-out]',
          sizeClasses[size],
          size === 'full' ? 'h-full' : 'max-h-[calc(100vh-4rem)]',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-[var(--font-display)]"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)]',
                'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
                'dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800',
                'transition-colors duration-150',
              )}
            >
              <XIcon />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(portal, document.body);
};

Modal.displayName = 'Modal';

export default Modal;

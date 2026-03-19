'use client';

import React, { useState, useRef, useCallback, useId } from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Position styles
// ─────────────────────────────────────────────────────────────────────────────

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowPositionClasses: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-800',
  right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-800',
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className,
}) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  }, []);

  // Clone child to add aria and event props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const child = React.cloneElement(children, {
    'aria-describedby': visible ? tooltipId : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      show();
      (children.props as any).onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide();
      (children.props as any).onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      show();
      (children.props as any).onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hide();
      (children.props as any).onBlur?.(e);
    },
  } as any);

  return (
    <span className="relative inline-flex">
      {child}

      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute z-50 pointer-events-none',
            'px-2.5 py-1.5 rounded-[var(--radius-sm)]',
            'bg-slate-800 text-white text-xs font-normal leading-snug',
            'whitespace-nowrap shadow-md',
            'animate-[fadeIn_0.15s_ease-out]',
            positionClasses[position],
            className,
          )}
        >
          {content}
          {/* Arrow */}
          <span
            aria-hidden="true"
            className={cn(
              'absolute w-0 h-0 border-4',
              arrowPositionClasses[position],
            )}
          />
        </span>
      )}
    </span>
  );
};

Tooltip.displayName = 'Tooltip';

export default Tooltip;

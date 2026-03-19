'use client';

import { cn } from '@/lib/utils';
import type { TabBarProps } from './tab-bar';
import { TabBar } from './tab-bar';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  tabs?: TabBarProps;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  actions,
  tabs,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        tabs && 'border-b border-slate-200 pb-0 dark:border-slate-700',
        className,
      )}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1
            className={cn(
              'font-display text-[36px] font-bold leading-tight tracking-tight text-slate-900',
              'dark:text-slate-50',
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-shrink-0 items-center gap-3 pt-1">
            {actions}
          </div>
        )}
      </div>

      {/* Tab bar */}
      {tabs && (
        <div className="-mb-px">
          <TabBar {...tabs} />
        </div>
      )}
    </div>
  );
}

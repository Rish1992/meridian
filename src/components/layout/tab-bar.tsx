'use client';

import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TabItem {
  label: string;
  value: string;
  badge?: number;
  icon?: React.ReactNode;
}

export type TabVariant = 'underline' | 'pill' | 'segmented';

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (value: string) => void;
  variant?: TabVariant;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function TabBar({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}: TabBarProps) {
  if (variant === 'underline') {
    return (
      <div
        className={cn(
          'flex items-end border-b border-slate-200 dark:border-slate-700',
          className,
        )}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
                isActive
                  ? 'text-brand-primary'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              {tab.icon && (
                <span className="flex-shrink-0">{tab.icon}</span>
              )}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    'inline-flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold leading-none',
                    isActive
                      ? 'bg-brand-primary text-white'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                  )}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
              {/* Active indicator bar */}
              <span
                className={cn(
                  'absolute bottom-0 left-0 h-0.5 w-full rounded-t-full bg-brand-primary transition-opacity duration-200',
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
              />
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <div
        className={cn('flex items-center gap-2', className)}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
                isActive
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
              )}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    'inline-flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none',
                    isActive
                      ? 'bg-white/30 text-white'
                      : 'bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-200',
                  )}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // segmented variant
  return (
    <div
      className={cn(
        'inline-flex items-stretch gap-0 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset',
              isActive
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={cn(
                  'inline-flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none',
                  isActive
                    ? 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                )}
              >
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

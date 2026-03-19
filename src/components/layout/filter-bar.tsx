'use client';

import { X, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type FilterType = 'select' | 'date' | 'search' | 'daterange';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
}

export type ActiveFilters = Record<string, string>;

interface FilterBarProps {
  filters: FilterConfig[];
  activeFilters: ActiveFilters;
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function FilterBar({
  filters,
  activeFilters,
  onFilterChange,
  onClear,
  className,
}: FilterBarProps) {
  const activeChips = Object.entries(activeFilters).filter(
    ([, value]) => value !== '' && value !== undefined,
  );

  const hasActiveFilters = activeChips.length > 0;

  function getChipLabel(key: string, value: string): string {
    const config = filters.find((f) => f.key === key);
    if (!config) return value;
    const option = config.options?.find((o) => o.value === value);
    return option ? `${config.label}: ${option.label}` : `${config.label}: ${value}`;
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Filter controls row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
        </div>

        {filters.map((filter) => {
          if (filter.type === 'search') {
            return (
              <div key={filter.key} className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={filter.placeholder ?? filter.label}
                  value={activeFilters[filter.key] ?? ''}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className={cn(
                    'h-8 rounded-md border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-900 outline-none',
                    'placeholder:text-slate-400',
                    'transition-colors duration-150',
                    'focus:border-brand-primary focus:ring-1 focus:ring-brand-primary',
                    'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500',
                    'dark:focus:border-brand-primary',
                  )}
                />
              </div>
            );
          }

          if (filter.type === 'select') {
            return (
              <select
                key={filter.key}
                value={activeFilters[filter.key] ?? ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className={cn(
                  'h-8 cursor-pointer rounded-md border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-700 outline-none appearance-none',
                  'transition-colors duration-150',
                  'focus:border-brand-primary focus:ring-1 focus:ring-brand-primary',
                  'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
                  activeFilters[filter.key]
                    ? 'border-brand-primary text-brand-primary dark:border-brand-primary dark:text-brand-primary'
                    : '',
                )}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                }}
              >
                <option value="">{filter.placeholder ?? `All ${filter.label}`}</option>
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          }

          if (filter.type === 'date') {
            return (
              <input
                key={filter.key}
                type="date"
                value={activeFilters[filter.key] ?? ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                title={filter.label}
                className={cn(
                  'h-8 cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none',
                  'transition-colors duration-150',
                  'focus:border-brand-primary focus:ring-1 focus:ring-brand-primary',
                  'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
                  '[color-scheme:light] dark:[color-scheme:dark]',
                )}
              />
            );
          }

          if (filter.type === 'daterange') {
            return (
              <div key={filter.key} className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">{filter.label}:</span>
                <input
                  type="date"
                  value={activeFilters[`${filter.key}_from`] ?? ''}
                  onChange={(e) =>
                    onFilterChange(`${filter.key}_from`, e.target.value)
                  }
                  title={`${filter.label} from`}
                  className={cn(
                    'h-8 cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none',
                    'transition-colors duration-150 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary',
                    'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
                    '[color-scheme:light] dark:[color-scheme:dark]',
                  )}
                />
                <span className="text-xs text-slate-400">–</span>
                <input
                  type="date"
                  value={activeFilters[`${filter.key}_to`] ?? ''}
                  onChange={(e) =>
                    onFilterChange(`${filter.key}_to`, e.target.value)
                  }
                  title={`${filter.label} to`}
                  className={cn(
                    'h-8 cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none',
                    'transition-colors duration-150 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary',
                    'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
                    '[color-scheme:light] dark:[color-scheme:dark]',
                  )}
                />
              </div>
            );
          }

          return null;
        })}

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-slate-500',
              'border border-slate-200 bg-transparent transition-colors duration-150',
              'hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700',
              'dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200',
            )}
          >
            <X className="h-3.5 w-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map(([key, value]) => (
            <span
              key={key}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-primary-surface px-2.5 py-0.5 text-xs font-medium text-brand-primary',
                'dark:border-brand-primary/30 dark:bg-brand-primary/10 dark:text-blue-300',
              )}
            >
              {getChipLabel(key, value)}
              <button
                onClick={() => onFilterChange(key, '')}
                className="flex-shrink-0 rounded-full p-0.5 transition-colors hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20"
                aria-label={`Remove ${key} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

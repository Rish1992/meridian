'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  searchable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ChevronDown icon
// ─────────────────────────────────────────────────────────────────────────────

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

function CheckMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option…',
      label,
      error,
      searchable = false,
      multiple = false,
      disabled = false,
      required = false,
      className,
      id,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selectedValues = multiple
      ? (Array.isArray(value) ? value : value ? [value] : [])
      : (typeof value === 'string' ? [value] : []);

    const filteredOptions = searchable && search
      ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
      : options;

    const selectId = id ?? (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    // Close on outside click
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setSearch('');
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Focus search when opening
    useEffect(() => {
      if (isOpen && searchable) {
        setTimeout(() => searchRef.current?.focus(), 10);
      }
    }, [isOpen, searchable]);

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen((prev) => !prev);
        if (isOpen) setSearch('');
      }
    };

    const handleSelect = useCallback(
      (optionValue: string) => {
        if (multiple) {
          const current = Array.isArray(value) ? value : value ? [value] : [];
          const next = current.includes(optionValue)
            ? current.filter((v) => v !== optionValue)
            : [...current, optionValue];
          onChange?.(next);
        } else {
          onChange?.(optionValue);
          setIsOpen(false);
          setSearch('');
        }
      },
      [multiple, value, onChange],
    );

    const handleRemovePill = (e: React.MouseEvent, optionValue: string) => {
      e.stopPropagation();
      if (multiple && Array.isArray(value)) {
        onChange?.(value.filter((v) => v !== optionValue));
      }
    };

    const getLabel = (val: string) => options.find((o) => o.value === val)?.label ?? val;

    const displayValue = () => {
      if (selectedValues.length === 0) return null;
      if (!multiple) return getLabel(selectedValues[0]);
      return null; // pills rendered separately for multi
    };

    return (
      <div className={cn('flex flex-col gap-1.5', className)} ref={ref}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-[var(--color-danger)]" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative" ref={containerRef}>
          {/* Trigger */}
          <button
            id={selectId}
            type="button"
            disabled={disabled}
            onClick={handleToggle}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className={cn(
              'w-full min-h-10 px-3 py-2 rounded-[var(--radius-md)] border text-sm text-left',
              'flex items-center gap-2 flex-wrap',
              'bg-white text-slate-900',
              'transition-all duration-150',
              'border-slate-300',
              isOpen
                ? 'border-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]/20'
                : 'hover:border-slate-400',
              error ? 'border-red-500' : '',
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-200',
              'dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600',
              isOpen
                ? 'dark:border-[var(--color-brand-primary)] dark:ring-[var(--color-brand-primary)]/30'
                : 'dark:hover:border-slate-500',
              'dark:disabled:bg-slate-900 dark:disabled:text-slate-600',
            )}
          >
            <span className="flex-1 flex flex-wrap gap-1 min-w-0">
              {multiple && selectedValues.length > 0 ? (
                selectedValues.map((val) => (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)] dark:bg-[var(--color-brand-primary-surface)] dark:text-[var(--color-brand-primary)]"
                  >
                    {getLabel(val)}
                    <button
                      type="button"
                      onClick={(e) => handleRemovePill(e, val)}
                      className="hover:opacity-70 transition-opacity"
                      aria-label={`Remove ${getLabel(val)}`}
                    >
                      <XMark className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className={displayValue() ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}>
                  {displayValue() ?? placeholder}
                </span>
              )}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 shrink-0 text-slate-400 transition-transform duration-150',
                isOpen && 'rotate-180',
              )}
            />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div
              role="listbox"
              aria-multiselectable={multiple}
              className={cn(
                'absolute z-50 mt-1 w-full rounded-[var(--radius-md)] border py-1',
                'bg-white shadow-md',
                'border-slate-200',
                'dark:bg-slate-800 dark:border-slate-700',
                'animate-[fadeIn_0.15s_ease-out]',
              )}
            >
              {searchable && (
                <div className="px-2 pb-1 border-b border-slate-100 dark:border-slate-700">
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search…"
                    className={cn(
                      'w-full h-8 px-2.5 text-sm rounded-[var(--radius-sm)]',
                      'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400',
                      'focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)]/20',
                      'dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500',
                    )}
                  />
                </div>
              )}

              <ul className="max-h-56 overflow-y-auto py-1">
                {filteredOptions.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500">
                    No options found
                  </li>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <li
                        key={option.value}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 text-sm cursor-pointer',
                          'transition-colors duration-100',
                          isSelected
                            ? 'bg-[var(--color-brand-primary-surface)] text-[var(--color-brand-primary)] dark:bg-[var(--color-brand-primary-surface)] dark:text-[var(--color-brand-primary)]'
                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700',
                        )}
                      >
                        <span>{option.label}</span>
                        {isSelected && (
                          <CheckMark className="w-4 h-4 shrink-0 text-[var(--color-brand-primary)]" />
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-[var(--color-danger)] dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;

'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';
import { Checkbox } from './checkbox';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DataTableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  width?: string | number;
}

export interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  data: T[];
  pagination?: DataTablePagination;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;
  rowKey?: (row: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  zebra?: boolean;
  className?: string;
}

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  if (direction === 'asc') return <ChevronUp className="w-3.5 h-3.5 shrink-0" />;
  if (direction === 'desc') return <ChevronDown className="w-3.5 h-3.5 shrink-0" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 shrink-0 opacity-40" />;
}

function EmptyState({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={9999}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        </div>
      </td>
    </tr>
  );
}

function SkeletonRows({ columns, count }: { columns: number; count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
          {Array.from({ length: columns }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DataTable<T = Record<string, unknown>>({
  columns,
  data,
  pagination,
  onSort,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  rowKey,
  emptyMessage = 'No data to display.',
  isLoading = false,
  zebra = false,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const getRowKey = (row: T, index: number): string => {
    if (rowKey) return rowKey(row);
    const r = row as Record<string, unknown>;
    return String(r['id'] ?? r['key'] ?? index);
  };

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  const allSelected =
    data.length > 0 && data.every((row, i) => selectedRows.includes(getRowKey(row, i)));

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((row, i) => getRowKey(row, i)));
    }
  };

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedRows.includes(id)) {
      onSelectionChange(selectedRows.filter((r) => r !== id));
    } else {
      onSelectionChange([...selectedRows, id]);
    }
  };

  // Pagination helpers
  const start = pagination ? (pagination.page - 1) * pagination.pageSize + 1 : 1;
  const end = pagination ? Math.min(pagination.page * pagination.pageSize, pagination.total) : data.length;
  const total = pagination ? pagination.total : data.length;
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Table wrapper */}
      <div className="overflow-auto rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm border-collapse">
          {/* Header */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              {selectable && (
                <th className="w-10 px-4 py-3 text-left">
                  <Checkbox
                    checked={allSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide whitespace-nowrap',
                    col.sortable && 'cursor-pointer select-none hover:text-slate-900 dark:hover:text-white',
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <SortIcon direction={sortKey === col.key ? sortDir : null} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <SkeletonRows columns={columns.length + (selectable ? 1 : 0)} count={8} />
            ) : data.length === 0 ? (
              <EmptyState message={emptyMessage} />
            ) : (
              data.map((row, rowIndex) => {
                const id = getRowKey(row, rowIndex);
                const isSelected = selectedRows.includes(id);
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'transition-colors duration-100',
                      onRowClick && 'cursor-pointer',
                      isSelected
                        ? 'bg-[var(--color-brand-primary-light,#eff6ff)] dark:bg-slate-800'
                        : [
                            'hover:bg-slate-50 dark:hover:bg-slate-800/60',
                            zebra && rowIndex % 2 === 1 && 'bg-slate-50/60 dark:bg-slate-800/30',
                          ],
                    )}
                  >
                    {selectable && (
                      <td
                        className="w-10 px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectRow(id)}
                          aria-label={`Select row ${id}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const r = row as Record<string, unknown>;
                      const cellValue = r[col.key];
                      return (
                        <td
                          key={col.key}
                          style={{ width: col.width }}
                          className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap"
                        >
                          {col.render ? col.render(cellValue, row) : String(cellValue ?? '—')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {pagination && (
        <div className="flex items-center justify-between px-1 pt-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium">{total === 0 ? 0 : start}</span>–
            <span className="font-medium">{end}</span> of{' '}
            <span className="font-medium">{total}</span>
          </p>

          <div className="flex items-center gap-3">
            {/* Page size selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Rows per page:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageChange(1, Number(e.target.value))}
                className="h-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-1.5 cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1, pagination.pageSize)}
                className={cn(
                  'h-7 px-2.5 rounded text-xs font-medium border transition-colors duration-150',
                  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
                  'text-slate-700 dark:text-slate-300',
                  'hover:bg-slate-50 dark:hover:bg-slate-700',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                )}
              >
                Prev
              </button>

              <span className="text-xs text-slate-500 dark:text-slate-400 px-1.5">
                {pagination.page} / {totalPages}
              </span>

              <button
                type="button"
                disabled={pagination.page >= totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1, pagination.pageSize)}
                className={cn(
                  'h-7 px-2.5 rounded text-xs font-medium border transition-colors duration-150',
                  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
                  'text-slate-700 dark:text-slate-300',
                  'hover:bg-slate-50 dark:hover:bg-slate-700',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                )}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;

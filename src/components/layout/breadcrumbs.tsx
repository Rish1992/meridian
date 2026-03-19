'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1.5 text-sm', className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="flex items-center gap-1.5">
            {isLast ? (
              <span
                className="font-medium text-slate-800 dark:text-slate-100"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="text-slate-500 transition-colors duration-150 hover:text-brand-primary dark:text-slate-400 dark:hover:text-brand-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                {item.label}
              </span>
            )}

            {!isLast && (
              <span
                className="select-none text-slate-300 dark:text-slate-600"
                aria-hidden="true"
              >
                /
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

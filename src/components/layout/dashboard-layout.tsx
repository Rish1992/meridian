'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { AppSidebar } from './app-sidebar';
import { TopBar } from './top-bar';
import type { BreadcrumbItem } from './breadcrumbs';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardLayout({
  children,
  breadcrumbs,
  className,
}: DashboardLayoutProps) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main area — offset by sidebar width */}
      <div
        className={cn(
          'flex flex-1 flex-col min-w-0',
          'transition-[margin-left] duration-200 ease-in-out',
          sidebarCollapsed ? 'ml-16' : 'ml-60',
        )}
      >
        {/* Top bar */}
        <TopBar breadcrumbs={breadcrumbs} />

        {/* Page content */}
        <main
          className={cn(
            'flex-1 overflow-auto',
            className,
          )}
        >
          <div
            className={cn(
              'mx-auto w-full px-8 py-8',
              'min-w-[960px] max-w-[1440px]',
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

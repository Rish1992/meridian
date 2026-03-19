'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  ShieldCheck,
  BarChart3,
  Users,
  Shuffle,
  RefreshCw,
  TrendingUp,
  MapPin,
  SearchCheck,
  FileBarChart2,
  Crown,
  MessageSquare,
  UserCog,
  Shield,
  Database,
  BookOpen,
  Plug,
  ScrollText,
  BrainCircuit,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Nav item definition
// ─────────────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS_BY_ROLE: Record<UserRole, NavItem[]> = {
  claims_agent: [
    { label: 'Dashboard', href: '/agent/dashboard', icon: LayoutDashboard },
    { label: 'Claims Queue', href: '/agent/claims', icon: ClipboardList },
  ],
  authorization_officer: [
    { label: 'Authorization Queue', href: '/authorization/queue', icon: ShieldCheck },
  ],
  operations_manager: [
    { label: 'Operations Dashboard', href: '/operations/dashboard', icon: LayoutDashboard },
    { label: 'Assignments', href: '/operations/assignments', icon: Users },
    { label: 'Round-Robin', href: '/operations/round-robin', icon: Shuffle },
    { label: 'Reassignment', href: '/operations/reassignment', icon: RefreshCw },
    { label: 'Performance', href: '/operations/performance', icon: TrendingUp },
    { label: 'Heatmap', href: '/operations/heatmap', icon: MapPin },
  ],
  qc_analyst: [
    { label: 'QC Browser', href: '/qc/browser', icon: SearchCheck },
    { label: 'QC Reports', href: '/qc/reports', icon: FileBarChart2 },
  ],
  cxo: [
    { label: 'Executive Dashboard', href: '/executive', icon: Crown },
    { label: 'Talk to Data', href: '/executive/talk-to-data', icon: MessageSquare },
  ],
  super_admin: [
    { label: 'Users', href: '/admin/users', icon: UserCog },
    { label: 'Roles', href: '/admin/roles', icon: Shield },
    { label: 'Master Data', href: '/admin/master-data', icon: Database },
    { label: 'Rules', href: '/admin/rules', icon: BookOpen },
    { label: 'Integrations', href: '/admin/integrations', icon: Plug },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText },
    { label: 'AI Model', href: '/admin/ai-model', icon: BrainCircuit },
  ],
};

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Settings', href: '#', icon: Settings },
  { label: 'Help & Support', href: '#', icon: HelpCircle },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface NavLinkProps {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}

function NavLink({ item, collapsed, isActive }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
        'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
        collapsed ? 'justify-center px-2' : 'justify-start',
        isActive
          ? 'bg-brand-primary text-white'
          : 'text-slate-300 hover:bg-brand-deep hover:text-white dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
      )}
    >
      {/* Left accent bar for active item */}
      {isActive && (
        <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-white" />
      )}

      <Icon
        className={cn(
          'flex-shrink-0 transition-transform duration-150',
          collapsed ? 'h-5 w-5' : 'h-4.5 w-4.5',
          isActive ? 'text-white' : 'text-slate-400 group-hover:text-white',
        )}
      />

      {!collapsed && (
        <span className="truncate leading-none">{item.label}</span>
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <span
          className={cn(
            'pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-md px-2.5 py-1.5',
            'bg-slate-900 text-xs font-medium text-white shadow-lg',
            'opacity-0 transition-opacity duration-150 group-hover:opacity-100',
            'dark:bg-slate-700',
          )}
        >
          {item.label}
        </span>
      )}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function AppSidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const pathname = usePathname();

  const navItems = user?.role ? NAV_ITEMS_BY_ROLE[user.role] ?? [] : [];

  const isActive = useCallback(
    (href: string) => {
      // Exact match always wins
      if (pathname === href) return true;
      // Only use startsWith for dynamic sub-routes (e.g. /agent/claims/[id]),
      // but NOT when another nav item is a more-specific match for the current path.
      const hasMoreSpecificMatch = navItems.some(
        (item) => item.href !== href && pathname.startsWith(item.href),
      );
      return !hasMoreSpecificMatch && pathname.startsWith(href + '/');
    },
    [pathname, navItems],
  );

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col',
        'bg-brand-navy dark:bg-slate-950',
        'border-r border-white/5',
        'transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex h-16 flex-shrink-0 items-center border-b border-white/5',
          collapsed ? 'justify-center px-2' : 'px-5',
        )}
      >
        {collapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary">
            <span className="font-display text-[10px] font-bold tracking-widest text-white">
              M
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            <span
              className="font-display text-[15px] font-bold tracking-[0.2em] text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              MERIDIAN
            </span>
            <span className="mt-0.5 text-[9px] font-medium tracking-[0.15em] text-slate-400">
              by AISTRA
            </span>
          </div>
        )}
      </div>

      {/* ── Main nav ─────────────────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4"
        aria-label="Main navigation"
      >
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                collapsed={collapsed}
                isActive={isActive(item.href)}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Bottom section ───────────────────────────────────── */}
      <div className="flex flex-col gap-0.5 border-t border-white/5 px-2 py-3">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            isActive={isActive(item.href)}
          />
        ))}

        {/* Logout */}
        <button
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
          className={cn(
            'group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
            'text-slate-400 transition-colors duration-150',
            'hover:bg-brand-deep hover:text-red-400 dark:hover:bg-slate-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
            collapsed ? 'justify-center px-2' : 'justify-start',
          )}
        >
          <LogOut
            className={cn(
              'flex-shrink-0 text-slate-400 transition-transform duration-150 group-hover:text-red-400',
              collapsed ? 'h-5 w-5' : 'h-4.5 w-4.5',
            )}
          />
          {!collapsed && <span className="truncate leading-none">Logout</span>}

          {/* Tooltip when collapsed */}
          {collapsed && (
            <span
              className={cn(
                'pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-md px-2.5 py-1.5',
                'bg-slate-900 text-xs font-medium text-white shadow-lg',
                'opacity-0 transition-opacity duration-150 group-hover:opacity-100',
                'dark:bg-slate-700',
              )}
            >
              Logout
            </span>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'mt-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
            'text-slate-500 transition-colors duration-150',
            'hover:bg-brand-deep hover:text-slate-300 dark:hover:bg-slate-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
            collapsed ? 'justify-center px-2' : 'justify-start',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4.5 w-4.5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4.5 w-4.5 flex-shrink-0" />
              <span className="truncate leading-none text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

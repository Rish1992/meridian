'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  Check,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import type { BreadcrumbItem } from './breadcrumbs';
import { Breadcrumbs } from './breadcrumbs';

// ─────────────────────────────────────────────────────────────────────────────
// Role labels
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  claims_agent: 'Claims Agent',
  authorization_officer: 'Auth Officer',
  operations_manager: 'Ops Manager',
  qc_analyst: 'QC Analyst',
  cxo: 'CXO',
  super_admin: 'Super Admin',
};

// ─────────────────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────────────────

function UserAvatar({ avatar, name }: { avatar: string; name: string }) {
  const isUrl = avatar.startsWith('http') || avatar.startsWith('/');
  if (isUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt={name}
        className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-primary/20"
      />
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary ring-2 ring-brand-primary/20">
      <span className="text-xs font-semibold text-white">{avatar}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification dropdown
// ─────────────────────────────────────────────────────────────────────────────

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const notifications = useUIStore((s) => s.notifications);
  const markNotificationRead = useUIStore((s) => s.markNotificationRead);
  const markAllRead = useUIStore((s) => s.markAllRead);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className={cn(
        'absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl',
        'dark:border-slate-700 dark:bg-slate-900',
        'animate-[fadeIn_0.15s_ease-out_both]',
        'z-50',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-brand-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-primary-hover"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <ul className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-slate-400">
            No notifications
          </li>
        ) : (
          notifications.slice(0, 10).map((n) => (
            <li
              key={n.id}
              className={cn(
                'border-b border-slate-50 px-4 py-3 last:border-0 dark:border-slate-800/50',
                !n.read && 'bg-brand-primary-surface dark:bg-brand-primary/5',
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm leading-snug',
                      n.read
                        ? 'font-normal text-slate-700 dark:text-slate-300'
                        : 'font-medium text-slate-900 dark:text-slate-100',
                    )}
                  >
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {formatRelativeTime(n.timestamp)}
                  </p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markNotificationRead(n.id)}
                    className="mt-0.5 flex-shrink-0 rounded-full p-1 text-brand-primary transition-colors hover:bg-brand-primary/10"
                    aria-label="Mark as read"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Footer */}
      <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
        <button
          onClick={onClose}
          className="w-full text-center text-xs text-brand-primary hover:text-brand-primary-hover"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// User dropdown
// ─────────────────────────────────────────────────────────────────────────────

function UserDropdown({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  function handleLogout() {
    logout();
    onClose();
    router.push('/login');
  }

  if (!user) return null;

  return (
    <div
      className={cn(
        'absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl',
        'dark:border-slate-700 dark:bg-slate-900',
        'animate-[fadeIn_0.15s_ease-out_both]',
        'z-50',
      )}
    >
      {/* User info */}
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {user.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
        <span
          className={cn(
            'mt-1.5 inline-flex rounded-full bg-brand-primary-surface px-2 py-0.5 text-[10px] font-semibold text-brand-primary',
            'dark:bg-brand-primary/10 dark:text-blue-300',
          )}
        >
          {ROLE_LABELS[user.role] ?? user.role}
        </span>
      </div>

      {/* Actions */}
      <div className="py-1.5">
        <Link
          href="/settings"
          onClick={onClose}
          className={cn(
            'flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700',
            'transition-colors hover:bg-slate-50 hover:text-slate-900',
            'dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
          )}
        >
          <Settings className="h-4 w-4 text-slate-400" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700',
            'transition-colors hover:bg-red-50 hover:text-red-600',
            'dark:text-slate-300 dark:hover:bg-red-900/20 dark:hover:text-red-400',
          )}
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          Logout
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TopBar
// ─────────────────────────────────────────────────────────────────────────────

interface TopBarProps {
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export function TopBar({ breadcrumbs, className }: TopBarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const user = useAuthStore((s) => s.user);
  const notifications = useUIStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Cmd+K focus
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6',
        'dark:border-slate-700 dark:bg-slate-900',
        'transition-colors duration-200',
        className,
      )}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumbs items={breadcrumbs} />
        ) : (
          <div className="h-4" />
        )}
      </div>

      {/* Center: Global search */}
      <div className="flex flex-1 max-w-sm items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="global-search"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search..."
            className={cn(
              'h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-14 text-sm text-slate-900',
              'placeholder:text-slate-400',
              'transition-all duration-150',
              'outline-none focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/20',
              'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500',
              'dark:focus:border-brand-primary dark:focus:bg-slate-800',
            )}
          />
          <kbd
            className={cn(
              'pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2',
              'flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5',
              'font-mono text-[10px] text-slate-400',
              'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500',
            )}
          >
            <span>⌘</span>
            <span>K</span>
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-1 items-center justify-end gap-2">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg text-slate-500',
              'transition-colors hover:bg-slate-100 hover:text-slate-800',
              'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
            )}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4.5 w-4.5" />
            ) : (
              <Moon className="h-4.5 w-4.5" />
            )}
          </button>
        )}

        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications((v) => !v);
              setShowUserMenu(false);
            }}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500',
              'transition-colors hover:bg-slate-100 hover:text-slate-800',
              'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
              showNotifications && 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
            )}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span
                className={cn(
                  'absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full',
                  'bg-red-500 px-1 text-[9px] font-bold text-white',
                )}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User avatar + dropdown */}
        {user && (
          <div ref={userRef} className="relative">
            <button
              onClick={() => {
                setShowUserMenu((v) => !v);
                setShowNotifications(false);
              }}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2 py-1.5',
                'transition-colors hover:bg-slate-100 dark:hover:bg-slate-800',
                showUserMenu && 'bg-slate-100 dark:bg-slate-800',
              )}
              aria-label="User menu"
            >
              <UserAvatar avatar={user.avatar} name={user.name} />
              <div className="hidden flex-col items-start sm:flex">
                <span className="text-xs font-semibold leading-none text-slate-800 dark:text-slate-200">
                  {user.name.split(' ')[0]}
                </span>
                <span className="mt-0.5 text-[10px] leading-none text-slate-500 dark:text-slate-400">
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-slate-400 transition-transform duration-150',
                  showUserMenu && 'rotate-180',
                )}
              />
            </button>

            {showUserMenu && (
              <UserDropdown onClose={() => setShowUserMenu(false)} />
            )}
          </div>
        )}
      </div>
    </header>
  );
}

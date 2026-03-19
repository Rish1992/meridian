'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ActivityFeedUser {
  name: string;
  /** URL or initials (e.g. "JD") */
  avatar: string;
}

export interface ActivityFeedItem {
  id?: string;
  user: ActivityFeedUser;
  action: string;
  target: string;
  timestamp: string; // ISO datetime
  link?: string;
}

export interface ActivityFeedProps {
  items: ActivityFeedItem[];
  maxItems?: number;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────────────────

function Avatar({ user }: { user: ActivityFeedUser }) {
  const isUrl = user.avatar.startsWith('http') || user.avatar.startsWith('/');

  if (isUrl) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white dark:ring-slate-800"
      />
    );
  }

  // Initials fallback
  const initials = user.avatar.length <= 3
    ? user.avatar
    : user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

  return (
    <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-[var(--color-brand-primary,#3b82f6)] text-white text-[11px] font-bold ring-1 ring-white dark:ring-slate-800">
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single feed item
// ─────────────────────────────────────────────────────────────────────────────

function FeedItem({ item }: { item: ActivityFeedItem }) {
  const content = (
    <div className="flex items-start gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-100">
      <Avatar user={item.user} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
          <span className="font-medium text-slate-900 dark:text-white">{item.user.name}</span>{' '}
          {item.action}{' '}
          <span className="font-medium text-slate-800 dark:text-slate-200">{item.target}</span>
        </p>
        <time
          dateTime={item.timestamp}
          className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block"
        >
          {formatRelativeTime(item.timestamp)}
        </time>
      </div>
    </div>
  );

  if (item.link) {
    return (
      <a href={item.link} className="block">
        {content}
      </a>
    );
  }

  return content;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ActivityFeed({
  items,
  maxItems,
  className,
}: ActivityFeedProps) {
  const displayed = maxItems ? items.slice(0, maxItems) : items;

  if (displayed.length === 0) {
    return (
      <p className={cn('text-sm text-slate-400 dark:text-slate-500 text-center py-6', className)}>
        No recent activity.
      </p>
    );
  }

  return (
    <div className={cn('overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800', className)}>
      {displayed.map((item, i) => (
        <FeedItem key={item.id ?? i} item={item} />
      ))}
    </div>
  );
}

export default ActivityFeed;

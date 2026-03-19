'use client';

import React, { useState } from 'react';
import { Medal, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui';
import type { User } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentCapacityCardProps {
  agent: User;
  variant?: 'roster' | 'config' | 'leaderboard';
  onToggle?: (agentId: string, active: boolean) => void;
  onCapacityChange?: (agentId: string, newCapacity: number) => void;
  rank?: number;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-orange-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getLoadColor(current: number, capacity: number): string {
  const ratio = capacity > 0 ? current / capacity : 0;
  if (ratio >= 0.9) return 'bg-red-500';
  if (ratio >= 0.7) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 90) return 'text-emerald-600 dark:text-emerald-400';
  if (accuracy >= 75) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

const STATUS_COLORS: Record<User['status'], string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-slate-400',
  on_leave: 'bg-amber-400',
};

// ─────────────────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────────────────

function Avatar({ agent }: { agent: User }) {
  const initials = getInitials(agent.name);
  const colorClass = getAvatarColor(agent.name);
  const statusColor = STATUS_COLORS[agent.status];

  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold select-none',
          colorClass,
        )}
        aria-label={agent.name}
      >
        {initials}
      </div>
      <span
        className={cn(
          'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900',
          statusColor,
        )}
        aria-label={`Status: ${agent.status}`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Load Bar
// ─────────────────────────────────────────────────────────────────────────────

function LoadBar({ current, capacity }: { current: number; capacity: number }) {
  const pct = capacity > 0 ? Math.min(100, (current / capacity) * 100) : 0;
  const color = getLoadColor(current, capacity);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-slate-500 dark:text-slate-400 w-10 text-right">
        {current}/{capacity}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Medal / Rank badge for leaderboard top 3
// ─────────────────────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <Trophy className="w-5 h-5 text-yellow-500" />;
  }
  if (rank === 2) {
    return <Medal className="w-5 h-5 text-slate-400" />;
  }
  if (rank === 3) {
    return <Medal className="w-5 h-5 text-amber-700" />;
  }
  return (
    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 w-5 text-center tabular-nums">
      {rank}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Roster variant
// ─────────────────────────────────────────────────────────────────────────────

function RosterCard({ agent, className }: AgentCapacityCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700',
        'p-3 transition-shadow duration-150 hover:shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <Avatar agent={agent} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {agent.name}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {agent.department}
          </p>
        </div>
        <span
          className={cn(
            'text-sm font-bold tabular-nums',
            getAccuracyColor(agent.accuracy),
          )}
        >
          {agent.accuracy}%
        </span>
      </div>
      <LoadBar current={agent.currentLoad} capacity={agent.capacity} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Config variant
// ─────────────────────────────────────────────────────────────────────────────

function ConfigCard({ agent, onToggle, onCapacityChange, className }: AgentCapacityCardProps) {
  const [isActive, setIsActive] = useState(agent.status === 'active');
  const [capacity, setCapacity] = useState(agent.capacity);

  const handleToggle = (checked: boolean) => {
    setIsActive(checked);
    onToggle?.(agent.id, checked);
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0) {
      setCapacity(val);
      onCapacityChange?.(agent.id, val);
    }
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-4',
        className,
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <Avatar agent={agent} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {agent.name}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate capitalize">
            {agent.role.replace(/_/g, ' ')}
          </p>
        </div>
        <Toggle
          checked={isActive}
          onChange={handleToggle}
          size="sm"
          aria-label={`Toggle active status for ${agent.name}`}
        />
      </div>

      <div className="flex flex-col gap-3">
        <LoadBar current={agent.currentLoad} capacity={capacity} />

        <div className="flex items-center justify-between">
          <label
            htmlFor={`capacity-${agent.id}`}
            className="text-xs text-slate-600 dark:text-slate-300 font-medium"
          >
            Max Capacity
          </label>
          <input
            id={`capacity-${agent.id}`}
            type="number"
            min={0}
            max={50}
            value={capacity}
            onChange={handleCapacityChange}
            className={cn(
              'w-16 h-7 px-2 text-xs text-right rounded-[var(--radius-sm)] border',
              'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800',
              'text-slate-800 dark:text-slate-100',
              'focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)]/20',
              'tabular-nums',
            )}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Accuracy</span>
          <span className={cn('font-bold', getAccuracyColor(agent.accuracy))}>
            {agent.accuracy}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard variant
// ─────────────────────────────────────────────────────────────────────────────

function LeaderboardCard({ agent, rank = 0, className }: AgentCapacityCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700',
        'flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800',
        rank <= 3 && 'border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20',
        className,
      )}
    >
      {/* Rank */}
      <div className="w-6 flex items-center justify-center shrink-0">
        <RankBadge rank={rank} />
      </div>

      <Avatar agent={agent} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
          {agent.name}
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          {agent.currentLoad} claims active
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className={cn('text-base font-bold tabular-nums', getAccuracyColor(agent.accuracy))}>
          {agent.accuracy}%
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">accuracy</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AgentCapacityCard({
  agent,
  variant = 'roster',
  onToggle,
  onCapacityChange,
  rank,
  className,
}: AgentCapacityCardProps) {
  if (variant === 'config') {
    return (
      <ConfigCard
        agent={agent}
        variant={variant}
        onToggle={onToggle}
        onCapacityChange={onCapacityChange}
        className={className}
      />
    );
  }
  if (variant === 'leaderboard') {
    return (
      <LeaderboardCard
        agent={agent}
        variant={variant}
        rank={rank}
        className={className}
      />
    );
  }
  return <RosterCard agent={agent} variant={variant} className={className} />;
}

export default AgentCapacityCard;

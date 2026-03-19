'use client';

import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Checkbox, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types & data
// ─────────────────────────────────────────────────────────────────────────────

interface RoleConfig {
  role: UserRole;
  label: string;
  description: string;
  color: string;
}

const ROLES: RoleConfig[] = [
  { role: 'claims_agent', label: 'Claims Agent', description: 'Process and review passenger claims', color: 'bg-blue-500' },
  { role: 'authorization_officer', label: 'Auth Officer', description: 'Authorize and approve claim payouts', color: 'bg-purple-500' },
  { role: 'operations_manager', label: 'Ops Manager', description: 'Manage teams and assignments', color: 'bg-teal-500' },
  { role: 'qc_analyst', label: 'QC Analyst', description: 'Quality control and compliance review', color: 'bg-amber-500' },
  { role: 'cxo', label: 'CXO', description: 'Executive oversight and analytics', color: 'bg-emerald-500' },
  { role: 'super_admin', label: 'Super Admin', description: 'Full system administration', color: 'bg-red-500' },
];

const PERMISSIONS = [
  'View Claims',
  'Edit Claims',
  'Assign Claims',
  'Approve Claims',
  'Configure Rules',
  'View Analytics',
  'Manage Users',
  'System Config',
];

const DEFAULT_MATRIX: Record<UserRole, boolean[]> = {
  claims_agent:          [true, true, false, false, false, false, false, false],
  authorization_officer: [true, false, false, true, false, true, false, false],
  operations_manager:    [true, true, true, false, true, true, false, false],
  qc_analyst:            [true, false, false, false, false, true, false, false],
  cxo:                   [true, false, false, false, false, true, false, false],
  super_admin:           [true, true, true, true, true, true, true, true],
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function RolePermissionManagerPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('claims_agent');
  const [matrix, setMatrix] = useState<Record<UserRole, boolean[]>>(DEFAULT_MATRIX);

  const handleToggle = (role: UserRole, permIndex: number) => {
    setMatrix((prev) => ({
      ...prev,
      [role]: prev[role].map((v, i) => (i === permIndex ? !v : v)),
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Role & Permission Manager"
        description="Configure access permissions for each role in the system."
      />

      <div className="flex gap-6">
        {/* Left: Role list */}
        <div className="w-64 shrink-0 flex flex-col gap-2">
          {ROLES.map((r) => (
            <button
              key={r.role}
              onClick={() => setSelectedRole(r.role)}
              className={cn(
                'flex items-start gap-3 px-4 py-3 rounded-[var(--radius-md)] text-left transition-all',
                selectedRole === r.role
                  ? 'bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 shadow-sm'
                  : 'bg-transparent border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60',
              )}
            >
              <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', r.color)} />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.label}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{r.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Right: Permission matrix */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-lg)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide w-48">
                    Permission
                  </th>
                  {ROLES.map((r) => (
                    <th
                      key={r.role}
                      className={cn(
                        'px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide',
                        selectedRole === r.role
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                          : 'text-slate-600 dark:text-slate-300',
                      )}
                    >
                      {r.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {PERMISSIONS.map((perm, permIdx) => (
                  <tr key={perm} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{perm}</span>
                      </div>
                    </td>
                    {ROLES.map((r) => (
                      <td
                        key={r.role}
                        className={cn(
                          'px-3 py-3 text-center',
                          selectedRole === r.role && 'bg-blue-50/50 dark:bg-blue-950/20',
                        )}
                      >
                        <Checkbox
                          checked={matrix[r.role][permIdx]}
                          onChange={() => handleToggle(r.role, permIdx)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

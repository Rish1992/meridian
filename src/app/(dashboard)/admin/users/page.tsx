'use client';

import React, { useState, useMemo } from 'react';
import { UserPlus, Search, Pencil, UserX } from 'lucide-react';
import { mockUsers } from '@/data/mock-data';
import { PageHeader } from '@/components/layout';
import { Button, DataTable, Badge, Toggle, Modal, TextInput, Select } from '@/components/ui';
import type { DataTableColumn, SelectOption } from '@/components/ui';
import { cn, formatDateTime } from '@/lib/utils';
import type { User, UserRole } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_OPTIONS: SelectOption[] = [
  { value: 'claims_agent', label: 'Claims Agent' },
  { value: 'authorization_officer', label: 'Authorization Officer' },
  { value: 'operations_manager', label: 'Operations Manager' },
  { value: 'qc_analyst', label: 'QC Analyst' },
  { value: 'cxo', label: 'CXO Executive' },
  { value: 'super_admin', label: 'Super Admin' },
];

const ROLE_BADGE_MAP: Record<UserRole, string> = {
  claims_agent: 'info',
  authorization_officer: 'purple',
  operations_manager: 'teal',
  qc_analyst: 'warning',
  cxo: 'success',
  super_admin: 'danger',
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<User | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<string>('claims_agent');
  const [formDepartment, setFormDepartment] = useState('');
  const [formCapacity, setFormCapacity] = useState('10');

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.includes(q),
    );
  }, [users, search]);

  const openCreateModal = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('claims_agent');
    setFormDepartment('');
    setFormCapacity('10');
    setShowCreateModal(true);
  };

  const openEditModal = (user: User) => {
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormDepartment(user.department);
    setFormCapacity(String(user.capacity));
    setEditUser(user);
  };

  const handleCreateUser = () => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: formName,
      email: formEmail,
      role: formRole as UserRole,
      avatar: formName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
      status: 'active',
      department: formDepartment,
      shiftStart: '09:00',
      shiftEnd: '18:00',
      capacity: Number(formCapacity) || 10,
      currentLoad: 0,
      accuracy: 90,
      specializations: [],
    };
    setUsers((prev) => [...prev, newUser]);
    setShowCreateModal(false);
  };

  const handleEditUser = () => {
    if (!editUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editUser.id
          ? { ...u, name: formName, email: formEmail, role: formRole as UserRole, department: formDepartment, capacity: Number(formCapacity) || 10 }
          : u,
      ),
    );
    setEditUser(null);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u,
      ),
    );
  };

  const handleDeactivate = () => {
    if (!deactivateUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === deactivateUser.id ? { ...u, status: 'inactive' as const } : u)),
    );
    setDeactivateUser(null);
  };

  // Mock last login dates
  const lastLoginMap: Record<string, string> = {
    'usr-001': '2026-03-17T08:30:00Z',
    'usr-002': '2026-03-17T09:15:00Z',
    'usr-003': '2026-03-16T17:45:00Z',
    'usr-004': '2026-03-17T11:00:00Z',
    'usr-006': '2026-03-17T09:00:00Z',
    'usr-008': '2026-03-16T16:30:00Z',
    'usr-010': '2026-03-17T08:45:00Z',
    'usr-011': '2026-03-15T14:00:00Z',
    'usr-012': '2026-03-17T07:00:00Z',
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
            {row.avatar}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{row.name}</p>
            <p className="text-[10px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (_, row) => (
        <Badge variant={(ROLE_BADGE_MAP[row.role] ?? 'default') as any} size="sm">
          {row.role.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => (
        <Toggle
          checked={row.status === 'active'}
          onChange={() => handleToggleStatus(row.id)}
          size="sm"
        />
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (_, row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {lastLoginMap[row.id] ? formatDateTime(lastLoginMap[row.id]) : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => openEditModal(row)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<UserX className="w-3.5 h-3.5" />}
            onClick={() => setDeactivateUser(row)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  // Form content for create/edit modal
  const renderForm = () => (
    <div className="flex flex-col gap-4">
      <TextInput label="Full Name" value={formName} onChange={(v) => setFormName(v)} placeholder="John Doe" />
      <TextInput label="Email" type="email" value={formEmail} onChange={(v) => setFormEmail(v)} placeholder="john@meridian.ai" />
      <Select label="Role" options={ROLE_OPTIONS} value={formRole} onChange={(v) => setFormRole(String(v))} />
      <TextInput label="Department" value={formDepartment} onChange={(v) => setFormDepartment(v)} placeholder="Claims Operations" />
      <TextInput label="Capacity" type="number" value={formCapacity} onChange={(v) => setFormCapacity(v)} placeholder="10" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="User Management"
        actions={
          <Button variant="primary" size="sm" icon={<UserPlus className="w-3.5 h-3.5" />} onClick={openCreateModal}>
            Create User
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'h-9 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm',
            'text-slate-800 placeholder:text-slate-400 outline-none',
            'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
            'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
          )}
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        emptyMessage="No users found."
      />

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create User"
        size="md"
        footer={
          <div className="flex items-center gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateUser} disabled={!formName || !formEmail}>Create</Button>
          </div>
        }
      >
        {renderForm()}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title={`Edit User — ${editUser?.name}`}
        size="md"
        footer={
          <div className="flex items-center gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleEditUser}>Save Changes</Button>
          </div>
        }
      >
        {renderForm()}
      </Modal>

      {/* Deactivate Confirmation */}
      <Modal
        isOpen={!!deactivateUser}
        onClose={() => setDeactivateUser(null)}
        title="Deactivate User"
        size="sm"
        footer={
          <div className="flex items-center gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setDeactivateUser(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDeactivate}>Deactivate</Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Are you sure you want to deactivate <strong>{deactivateUser?.name}</strong>? They will no longer be able to log in or receive new claim assignments.
        </p>
      </Modal>
    </div>
  );
}

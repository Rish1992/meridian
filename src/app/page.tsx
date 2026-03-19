'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@/types';

const ROLE_REDIRECTS: Record<UserRole, string> = {
  claims_agent: '/agent/dashboard',
  authorization_officer: '/authorization/queue',
  operations_manager: '/operations/dashboard',
  qc_analyst: '/qc/browser',
  cxo: '/executive',
  super_admin: '/admin/users',
};

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    } else {
      router.replace(ROLE_REDIRECTS[user.role]);
    }
  }, [isAuthenticated, user, router]);

  // Render nothing while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <svg className="animate-spin w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

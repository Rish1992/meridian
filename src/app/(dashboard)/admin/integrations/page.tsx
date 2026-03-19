'use client';

import React, { useState } from 'react';
import {
  Plane,
  AlertTriangle,
  Users,
  CreditCard,
  Globe,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button, MetricCard, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Integration data
// ─────────────────────────────────────────────────────────────────────────────

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'degraded';
  lastSync: string;
  errorCount: number;
  endpoint: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'int-1',
    name: 'Core Airline System',
    description: 'Flight schedules, PNR data, and passenger records from the primary reservation system.',
    icon: <Plane className="w-5 h-5" />,
    status: 'connected',
    lastSync: '2 minutes ago',
    errorCount: 0,
    endpoint: 'https://api.core-airline.meridian.ai/v2/***',
  },
  {
    id: 'int-2',
    name: 'Disruption Mgmt Platform',
    description: 'Real-time disruption events, IRROPS data, and recovery actions from the ops center.',
    icon: <AlertTriangle className="w-5 h-5" />,
    status: 'connected',
    lastSync: '5 minutes ago',
    errorCount: 2,
    endpoint: 'https://disruption-api.meridian.ai/v1/***',
  },
  {
    id: 'int-3',
    name: 'Customer Claims Portal',
    description: 'Passenger-facing claims submission portal for document uploads and status tracking.',
    icon: <Globe className="w-5 h-5" />,
    status: 'connected',
    lastSync: '1 minute ago',
    errorCount: 0,
    endpoint: 'https://claims-portal.meridian.ai/api/***',
  },
  {
    id: 'int-4',
    name: 'User Management (SSO)',
    description: 'Single sign-on, employee directory, and role management via corporate identity provider.',
    icon: <Users className="w-5 h-5" />,
    status: 'degraded',
    lastSync: '15 minutes ago',
    errorCount: 7,
    endpoint: 'https://sso.aistra.com/saml/***',
  },
  {
    id: 'int-5',
    name: 'Payment Gateway',
    description: 'Processes claim payouts via bank transfer, wallet, or credit back to original payment method.',
    icon: <CreditCard className="w-5 h-5" />,
    status: 'connected',
    lastSync: '8 minutes ago',
    errorCount: 0,
    endpoint: 'https://payments.meridian.ai/gateway/***',
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; dotColor: string }> = {
  connected: { label: 'Connected', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', dotColor: 'bg-emerald-500' },
  disconnected: { label: 'Disconnected', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/30', dotColor: 'bg-red-500' },
  degraded: { label: 'Degraded', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/30', dotColor: 'bg-amber-500' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function IntegrationSettingsPage() {
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const handleTestConnection = (id: string) => {
    setTesting((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setTesting((prev) => ({ ...prev, [id]: false })), 2000);
  };

  const handleSync = (id: string) => {
    setSyncing((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setSyncing((prev) => ({ ...prev, [id]: false })), 3000);
  };

  const connectedCount = INTEGRATIONS.filter((i) => i.status === 'connected').length;
  const totalErrors = INTEGRATIONS.reduce((sum, i) => sum + i.errorCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Integration Settings"
        description="Monitor and manage external system connections."
      />

      {/* Health metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Connected"
          value={connectedCount}
          trend={{ direction: 'flat', value: `of ${INTEGRATIONS.length}`, isPositive: true }}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <MetricCard
          label="Degraded"
          value={INTEGRATIONS.filter((i) => i.status === 'degraded').length}
          trend={{ direction: 'up', value: '+1', isPositive: false }}
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <MetricCard
          label="Total Errors (24h)"
          value={totalErrors}
          trend={{ direction: 'down', value: '-3', isPositive: true }}
          icon={<XCircle className="w-4 h-4" />}
        />
        <MetricCard
          label="Uptime (30d)"
          value="99.7%"
          trend={{ direction: 'up', value: '+0.2%', isPositive: true }}
          icon={<Zap className="w-4 h-4" />}
        />
      </div>

      {/* Integration cards grid */}
      <div className="grid grid-cols-2 gap-4">
        {INTEGRATIONS.map((integration) => {
          const statusCfg = STATUS_CONFIG[integration.status];
          return (
            <div
              key={integration.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-lg)] p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{integration.name}</h3>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 text-[10px] font-semibold mt-0.5',
                      statusCfg.color,
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dotColor)} />
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
                {integration.errorCount > 0 && (
                  <Badge variant="danger" size="sm">{integration.errorCount} errors</Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {integration.description}
              </p>

              {/* Details */}
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Sync</span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{integration.lastSync}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Endpoint</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400 text-[10px]">{integration.endpoint}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Zap className="w-3.5 h-3.5" />}
                  isLoading={testing[integration.id]}
                  onClick={() => handleTestConnection(integration.id)}
                >
                  Test Connection
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<RefreshCw className={cn('w-3.5 h-3.5', syncing[integration.id] && 'animate-spin')} />}
                  isLoading={syncing[integration.id]}
                  onClick={() => handleSync(integration.id)}
                >
                  Sync Now
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

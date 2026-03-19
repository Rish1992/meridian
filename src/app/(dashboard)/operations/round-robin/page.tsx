'use client';

import React, { useState } from 'react';
import { Save, RefreshCw, Star } from 'lucide-react';
import { mockUsers } from '@/data/mock-data';
import { PageHeader } from '@/components/layout';
import { Button, Toggle } from '@/components/ui';
import { AgentCapacityCard } from '@/components/domain';
import type { User } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AgentConfig {
  agentId: string;
  active: boolean;
  capacity: number;
  shiftStart: string;
  shiftEnd: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Config Card (extends AgentCapacityCard config variant with shifts)
// ─────────────────────────────────────────────────────────────────────────────

interface AgentConfigCardProps {
  agent: User;
  config: AgentConfig;
  onChange: (update: Partial<AgentConfig>) => void;
}

function AgentConfigRow({ agent, config, onChange }: AgentConfigCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-start gap-4">
        {/* Agent capacity card (config variant) */}
        <div className="flex-1 min-w-0">
          <AgentCapacityCard
            agent={{
              ...agent,
              capacity: config.capacity,
              status: config.active ? 'active' : 'inactive',
            }}
            variant="config"
            onToggle={(_, active) => onChange({ active })}
            onCapacityChange={(_, capacity) => onChange({ capacity })}
          />
        </div>

        {/* Shift times */}
        <div className="flex flex-col gap-3 shrink-0 w-56">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-600 dark:text-slate-300 font-medium">Shift Start</label>
            <input
              type="time"
              value={config.shiftStart}
              onChange={(e) => onChange({ shiftStart: e.target.value })}
              className="w-28 h-8 px-2 text-xs rounded-[var(--radius-sm)] border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-600 dark:text-slate-300 font-medium">Shift End</label>
            <input
              type="time"
              value={config.shiftEnd}
              onChange={(e) => onChange({ shiftEnd: e.target.value })}
              className="w-28 h-8 px-2 text-xs rounded-[var(--radius-sm)] border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function RoundRobinConfigPage() {
  const agents = mockUsers.filter((u) => u.role === 'claims_agent');

  const [agentConfigs, setAgentConfigs] = useState<Record<string, AgentConfig>>(
    Object.fromEntries(
      agents.map((agent) => [
        agent.id,
        {
          agentId: agent.id,
          active: agent.status === 'active',
          capacity: agent.capacity,
          shiftStart: agent.shiftStart,
          shiftEnd: agent.shiftEnd,
        },
      ]),
    ),
  );

  const [routeHighValue, setRouteHighValue] = useState(true);
  const [saved, setSaved] = useState(false);

  const updateConfig = (agentId: string, update: Partial<AgentConfig>) => {
    setAgentConfigs((prev) => ({
      ...prev,
      [agentId]: { ...prev[agentId], ...update },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // In a real app, this would persist to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setAgentConfigs(
      Object.fromEntries(
        agents.map((agent) => [
          agent.id,
          {
            agentId: agent.id,
            active: agent.status === 'active',
            capacity: agent.capacity,
            shiftStart: agent.shiftStart,
            shiftEnd: agent.shiftEnd,
          },
        ]),
      ),
    );
    setSaved(false);
  };

  const activeCount = Object.values(agentConfigs).filter((c) => c.active).length;
  const totalCapacity = Object.values(agentConfigs)
    .filter((c) => c.active)
    .reduce((sum, c) => sum + c.capacity, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Round-Robin Configuration"
        description="Configure agent participation and capacity for automatic round-robin assignment."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Save className="w-3.5 h-3.5" />}
              onClick={handleSave}
            >
              {saved ? 'Saved!' : 'Save Configuration'}
            </Button>
          </div>
        }
      />

      {/* Summary bar */}
      <div className="flex items-center gap-6 px-5 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-[var(--radius-md)] border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <span className="font-bold tabular-nums">{activeCount}</span> agent{activeCount !== 1 ? 's' : ''} active in round-robin
        </div>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          Total capacity: <span className="font-bold tabular-nums">{totalCapacity}</span> claims
        </div>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          Avg per agent: <span className="font-bold tabular-nums">
            {activeCount > 0 ? Math.round(totalCapacity / activeCount) : 0}
          </span>
        </div>
      </div>

      {/* Agent list */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Agent Configuration</h2>
        {agents.map((agent) => (
          <AgentConfigRow
            key={agent.id}
            agent={agent}
            config={agentConfigs[agent.id]}
            onChange={(update) => updateConfig(agent.id, update)}
          />
        ))}
      </div>

      {/* Priority routing section */}
      <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          Priority Routing Rules
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex-1 mr-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Route high-value claims to senior agents
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Claims above $1,000 will be automatically assigned to agents with 'high_value_claims' specialization (e.g. Sarah Chen)
              </p>
            </div>
            <Toggle
              checked={routeHighValue}
              onChange={setRouteHighValue}
              size="md"
              aria-label="Route high-value claims to senior agents"
            />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex-1 mr-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Respect agent specializations
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Match claims to agents with relevant specializations when possible (EU261, GCC routes, etc.)
              </p>
            </div>
            <Toggle
              checked={true}
              onChange={() => {}}
              size="md"
              aria-label="Respect agent specializations"
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex-1 mr-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Skip agents on leave
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically exclude agents with 'on_leave' status from round-robin rotation
              </p>
            </div>
            <Toggle
              checked={true}
              onChange={() => {}}
              size="md"
              aria-label="Skip agents on leave"
            />
          </div>
        </div>
      </div>

      {/* Save button at bottom */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          icon={<Save className="w-4 h-4" />}
          onClick={handleSave}
        >
          {saved ? 'Configuration Saved!' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
}

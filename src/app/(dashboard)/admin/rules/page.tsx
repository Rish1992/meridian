'use client';

import React, { useState, useMemo } from 'react';
import { Plus, CheckCircle2, XCircle } from 'lucide-react';
import { mockBusinessRules, mockClaims, mockRuleEvaluations } from '@/data/mock-data';
import { PageHeader, TabBar } from '@/components/layout';
import { Button, Modal, Badge } from '@/components/ui';
import { RuleCard } from '@/components/domain';
import { formatCurrency, cn } from '@/lib/utils';
import type { BusinessRule } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active', badge: 0 },
  { label: 'Draft', value: 'draft', badge: 0 },
  { label: 'Archived', value: 'archived', badge: 0 },
];

export default function BusinessRulesBuilderPage() {
  const [rules, setRules] = useState<BusinessRule[]>(mockBusinessRules);
  const [statusFilter, setStatusFilter] = useState('all');
  const [testRuleId, setTestRuleId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ claimId: string; result: 'pass' | 'fail'; amount: number } | null>(null);

  const tabs = useMemo(() => {
    return STATUS_TABS.map((t) => ({
      ...t,
      badge: t.value === 'all' ? rules.length : rules.filter((r) => r.status === t.value).length,
    }));
  }, [rules]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return rules;
    return rules.filter((r) => r.status === statusFilter);
  }, [rules, statusFilter]);

  const handleToggle = (ruleId: string, newStatus: BusinessRule['status']) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, status: newStatus } : r)),
    );
  };

  const handleTest = (ruleId: string) => {
    setTestRuleId(ruleId);
    // Simulate test against a random claim
    const randomClaim = mockClaims[Math.floor(Math.random() * mockClaims.length)];
    const existingEval = mockRuleEvaluations.find((e) => e.ruleId === ruleId && e.claimId === randomClaim.id);

    setTestResults({
      claimId: randomClaim.id,
      result: existingEval?.result ?? (Math.random() > 0.3 ? 'pass' : 'fail'),
      amount: existingEval?.calculatedAmount ?? Math.round(Math.random() * 500),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Business Rules Builder"
        description="Create, edit, test, and manage business rules for claims processing."
        actions={
          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
            Create Rule
          </Button>
        }
      />

      <TabBar
        tabs={tabs}
        activeTab={statusFilter}
        onChange={setStatusFilter}
        variant="pill"
      />

      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">No rules found for this filter.</p>
          </div>
        ) : (
          filtered.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              variant="builder"
              onEdit={() => {}}
              onTest={() => handleTest(rule.id)}
              onToggle={handleToggle}
            />
          ))
        )}
      </div>

      {/* Test Results Modal */}
      <Modal
        isOpen={!!testRuleId}
        onClose={() => { setTestRuleId(null); setTestResults(null); }}
        title="Rule Test Results"
        size="md"
        footer={
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => { setTestRuleId(null); setTestResults(null); }}>
              Close
            </Button>
          </div>
        }
      >
        {testResults && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] bg-slate-50 dark:bg-slate-800">
              <span className="text-xs text-slate-500">Tested against:</span>
              <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">{testResults.claimId}</span>
              <span className="text-xs text-slate-400">(randomly selected)</span>
            </div>

            <div className={cn(
              'flex items-center gap-3 p-4 rounded-[var(--radius-md)]',
              testResults.result === 'pass'
                ? 'bg-emerald-50 dark:bg-emerald-950/30'
                : 'bg-red-50 dark:bg-red-950/30',
            )}>
              {testResults.result === 'pass' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className={cn(
                  'text-sm font-bold',
                  testResults.result === 'pass' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400',
                )}>
                  {testResults.result === 'pass' ? 'PASS' : 'FAIL'}
                </p>
                {testResults.amount > 0 && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Calculated amount: <strong>{formatCurrency(testResults.amount)}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-800 rounded-[var(--radius-sm)]">
              <p className="font-medium mb-1">Test Details:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Rule evaluated in isolation against selected claim</li>
                <li>All claim conditions checked against rule parameters</li>
                <li>Calculated amount reflects cap and threshold logic</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

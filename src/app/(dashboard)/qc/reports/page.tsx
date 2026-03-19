'use client';

import React, { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { mockQCReviews, mockUsers, mockClaims } from '@/data/mock-data';
import { PageHeader } from '@/components/layout';
import { Button, MetricCard, DataTable, Badge } from '@/components/ui';
import type { DataTableColumn } from '@/components/ui';
import { BarChart, DonutChart } from '@/components/charts';
import type { QCVerdict } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Period tabs
// ─────────────────────────────────────────────────────────────────────────────

const PERIOD_TABS = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '3 Months', value: '3m' },
  { label: '12 Months', value: '12m' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

interface AgentQualityRow {
  id: string;
  name: string;
  claimsReviewed: number;
  complianceRate: number;
  avgRating: number;
  commonIssues: string;
}

function getAgentQualityData(): AgentQualityRow[] {
  const agentReviews: Record<string, { total: number; compliant: number; ratings: number[]; issues: string[] }> = {};

  mockQCReviews.forEach((review) => {
    const claim = mockClaims.find((c) => c.id === review.claimId);
    const agentId = claim?.assignedAgentId;
    if (!agentId) return;

    if (!agentReviews[agentId]) {
      agentReviews[agentId] = { total: 0, compliant: 0, ratings: [], issues: [] };
    }

    agentReviews[agentId].total++;
    if (review.verdict === 'compliant') agentReviews[agentId].compliant++;

    review.sections.forEach((s) =>
      s.items.forEach((item) => {
        agentReviews[agentId].ratings.push(item.rating);
        if (item.rating <= 3 && item.comment) {
          agentReviews[agentId].issues.push(item.comment);
        }
      }),
    );
  });

  return Object.entries(agentReviews).map(([agentId, data]) => {
    const agent = mockUsers.find((u) => u.id === agentId);
    const avgRating = data.ratings.length > 0 ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length : 0;
    return {
      id: agentId,
      name: agent?.name ?? 'Unknown',
      claimsReviewed: data.total,
      complianceRate: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0,
      avgRating: Math.round(avgRating * 10) / 10,
      commonIssues: data.issues.length > 0 ? data.issues[0].substring(0, 60) + '...' : 'None',
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function QCReportsPage() {
  const [period, setPeriod] = useState('30d');

  const totalReviewed = mockQCReviews.length;
  const compliant = mockQCReviews.filter((r) => r.verdict === 'compliant').length;
  const nonCompliant = totalReviewed - compliant;
  const flagged = mockQCReviews.filter((r) => r.flaggedForTraining).length;
  const complianceRate = totalReviewed > 0 ? Math.round((compliant / totalReviewed) * 100) : 0;
  const nonCompliantRate = totalReviewed > 0 ? Math.round((nonCompliant / totalReviewed) * 100) : 0;

  // Verdict distribution for donut
  const verdictCounts: Record<QCVerdict, number> = { compliant: 0, minor_issues: 0, major_issues: 0, critical: 0 };
  mockQCReviews.forEach((r) => verdictCounts[r.verdict]++);
  const verdictDonut = [
    { name: 'Compliant', value: verdictCounts.compliant, color: '#10B981' },
    { name: 'Minor Issues', value: verdictCounts.minor_issues, color: '#F59E0B' },
    { name: 'Major Issues', value: verdictCounts.major_issues, color: '#F43F5E' },
    { name: 'Critical', value: verdictCounts.critical, color: '#DC2626' },
  ].filter((d) => d.value > 0);

  // Compliance rate by agent for bar chart
  const agentData = getAgentQualityData();
  const complianceByAgent = agentData.map((a) => ({
    agent: a.name.split(' ')[0],
    complianceRate: a.complianceRate,
  }));

  // Table columns
  const columns: DataTableColumn<AgentQualityRow>[] = [
    {
      key: 'name',
      label: 'Agent Name',
      render: (v) => <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{String(v)}</span>,
    },
    {
      key: 'claimsReviewed',
      label: 'Claims Reviewed',
      sortable: true,
      render: (v) => <span className="text-sm font-semibold tabular-nums">{String(v)}</span>,
    },
    {
      key: 'complianceRate',
      label: 'Compliance Rate',
      sortable: true,
      render: (v) => {
        const rate = Number(v);
        return (
          <div className="max-w-[80px]">
            <Badge variant={rate >= 80 ? 'success' : rate >= 50 ? 'warning' : 'danger'} size="sm">
              {rate}%
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'avgRating',
      label: 'Avg Rating',
      sortable: true,
      render: (v) => (
        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 tabular-nums">{String(v)} / 5</span>
      ),
    },
    {
      key: 'commonIssues',
      label: 'Common Issues',
      render: (v) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] block">{String(v)}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="QC Reports"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {PERIOD_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setPeriod(tab.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    period === tab.value
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
              Export
            </Button>
          </div>
        }
      />

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 [&>*]:min-w-0 [&>*]:overflow-hidden">
        <MetricCard
          label="Total Reviewed"
          value={totalReviewed}
          trend={{ direction: 'up', value: '+12%', isPositive: true }}
          sparklineData={[8, 12, 9, 15, 11, 18, totalReviewed]}
        />
        <MetricCard
          label="Compliance Rate"
          value={`${complianceRate}%`}
          trend={{ direction: 'up', value: '+3.2%', isPositive: true }}
          sparklineData={[78, 82, 80, 85, 88, complianceRate]}
        />
        <MetricCard
          label="Non-Compliant Rate"
          value={`${nonCompliantRate}%`}
          trend={{ direction: 'down', value: '-2.1%', isPositive: true }}
          sparklineData={[22, 18, 20, 15, 12, nonCompliantRate]}
        />
        <MetricCard
          label="Flagged for Training"
          value={flagged}
          trend={{ direction: 'down', value: '-1', isPositive: true }}
          sparklineData={[5, 4, 6, 3, 2, flagged]}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4 overflow-hidden min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Compliance Rate by Agent</h3>
          <div className="h-[250px]">
            <BarChart
              data={complianceByAgent}
              xKey="agent"
              yKeys={['complianceRate']}
              height={250}
              showGrid
            />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4 overflow-hidden min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Verdict Distribution</h3>
          <div className="h-[250px]">
            <DonutChart
              data={verdictDonut}
              centerLabel="Total"
              centerValue={totalReviewed}
              showLegend
              height={250}
            />
          </div>
        </div>
      </div>

      {/* Agent quality rankings */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Agent Quality Rankings</h3>
        <DataTable
          columns={columns}
          data={agentData}
          rowKey={(row) => row.id}
          emptyMessage="No quality data available."
        />
      </div>
    </div>
  );
}

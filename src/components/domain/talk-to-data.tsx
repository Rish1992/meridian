'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, LineChart, DonutChart, GaugeChart } from '@/components/charts';
import { analyticsData } from '@/data/mock-data';
import { formatCurrency } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TalkToDataProps {
  className?: string;
}

type ChartType = 'bar' | 'line' | 'donut' | 'gauge' | 'table' | 'none';

interface MetricCallout {
  label: string;
  value: string;
  highlight?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chartType?: ChartType;
  chartData?: Record<string, unknown>[];
  chartXKey?: string;
  chartYKeys?: string[];
  metrics?: MetricCallout[];
  followUps?: string[];
  donutData?: { name: string; value: number }[];
  gaugeValue?: number;
  gaugeTarget?: number;
  tableHeaders?: string[];
  tableRows?: string[][];
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggested queries
// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTED_QUERIES = [
  'Total payout this quarter?',
  'Top routes by claims?',
  'Agent performance comparison',
  'Disruption trends last 6 months',
  'SLA compliance rate',
  'Rejection analysis',
  'Average processing time',
  'Claims by jurisdiction',
  'Fraud flag rate trend',
  'Busiest disruption period?',
];

// ─────────────────────────────────────────────────────────────────────────────
// Response generator
// ─────────────────────────────────────────────────────────────────────────────

function generateResponse(query: string): Omit<Message, 'id' | 'role'> {
  const q = query.toLowerCase();

  // Payout / cost / spend
  if (q.includes('payout') || q.includes('cost') || q.includes('spend')) {
    const barData = analyticsData.payoutByMonth.map((p) => ({
      month: p.month.slice(0, 3),
      compensation: Math.round(p.alternateCarrier / 1000),
      reimbursement: Math.round((p.hotelExpenses + p.mealExpenses + p.cabExpenses + p.other) / 1000),
    }));
    return {
      content:
        'Total payouts have trended upward through H2 2025 before partially normalising in early 2026. Hotel expenses remain the largest cost driver at 41.8% of spend, with alternate-carrier rebooking costs rising notably in Q4 2025. March 2026 shows a mid-month cut-off and is not yet complete.',
      chartType: 'bar',
      chartData: barData,
      chartXKey: 'month',
      chartYKeys: ['compensation', 'reimbursement'],
      metrics: [
        { label: 'Peak Month Payout', value: '$98,760', highlight: true },
        { label: 'Hotel Share', value: '41.8%' },
        { label: 'Avg Monthly Payout', value: '$76,240' },
      ],
      followUps: ['Break down by category', 'Compare with last quarter', 'Show by route'],
    };
  }

  // Route / flight
  if (q.includes('route') || q.includes('flight')) {
    const topRoutes = analyticsData.routeAnalytics.slice(0, 5);
    return {
      content:
        'DEL→LHR is the highest-volume route, accounting for 234 claims and $87K in payouts — driven primarily by long-haul delays exceeding 3 hours. BOM→DXB and DEL→BOM together contribute 387 claims, with cancellations and denied boarding as the leading disruption types. European and GCC corridors carry disproportionately high average payouts.',
      chartType: 'bar',
      chartData: topRoutes.map((r) => ({ route: r.route.replace(' → ', '→'), claims: r.claimCount })),
      chartXKey: 'route',
      chartYKeys: ['claims'],
      metrics: [
        { label: 'Top Route Claims', value: '234 (DEL→LHR)', highlight: true },
        { label: 'Top Route Payout', value: formatCurrency(87340) },
        { label: 'Avg Payout/Route', value: formatCurrency(51198) },
      ],
      followUps: ['Show payout by route', 'Filter by airline', 'Break down by disruption type'],
    };
  }

  // Agent / performance
  if (q.includes('agent') || q.includes('performance')) {
    const agentData = analyticsData.agentPerformance.map((a) => ({
      agent: a.agentName.split(' ')[0],
      claims: a.claimsProcessed,
      accuracy: a.accuracy,
    }));
    return {
      content:
        'Sarah Chen leads all agents with 312 claims processed at 97% accuracy, well above the 92.6% team average. Mohammed Al-Rashid shows the highest return rate at 11%, suggesting additional coaching opportunities. Overall team SLA compliance is strong at 95.4% average, with Priya Sharma and Sarah Chen both exceeding 96%.',
      chartType: 'bar',
      chartData: agentData,
      chartXKey: 'agent',
      chartYKeys: ['claims', 'accuracy'],
      metrics: [
        { label: 'Top Agent', value: 'Sarah Chen (97%)', highlight: true },
        { label: 'Team Avg Accuracy', value: '92.6%' },
        { label: 'Avg SLA Compliance', value: '95.4%' },
      ],
      followUps: ['Show SLA compliance by agent', 'Compare approval rates', 'Show return rates'],
    };
  }

  // Trend / month
  if (q.includes('trend') || q.includes('month')) {
    const trendData = analyticsData.claimsByMonth.map((m) => ({
      month: m.month.slice(0, 3),
      claims: m.claims,
      approved: m.approved,
    }));
    return {
      content:
        'Claims volume rose steadily from 287 in May 2025 to a 12-month peak of 445 in December 2025, a 55% increase. January 2026 saw a seasonal pullback before volume climbed again in February. The approval rate has remained consistent at approximately 78%, indicating stable adjudication quality despite volume growth.',
      chartType: 'line',
      chartData: trendData,
      chartXKey: 'month',
      chartYKeys: ['claims', 'approved'],
      metrics: [
        { label: '12-Month Peak', value: '445 claims (Dec)', highlight: true },
        { label: 'YTD Growth', value: '+55%' },
        { label: 'Avg Approval Rate', value: '78.3%' },
      ],
      followUps: ['Break down by disruption type', 'Show rejection trend', 'Compare year-over-year'],
    };
  }

  // Disruption / cancel
  if (q.includes('disruption') || q.includes('cancel') || q.includes('busiest')) {
    const donutData = analyticsData.claimsByDisruptionType.map((d) => ({
      name: d.type,
      value: d.count,
    }));
    return {
      content:
        'Flight delays dominate at 52.4% of all claims, but cancellations carry a 45% higher average payout ($412 vs $284). Denied boarding cases, while only 12% of volume, command the second-highest per-claim payout at $356. Diversions are rare but represent the costliest average resolution at $521 per claim.',
      chartType: 'donut',
      donutData,
      metrics: [
        { label: 'Largest Category', value: 'Delays (52.4%)', highlight: true },
        { label: 'Highest Avg Payout', value: 'Diversions ($521)' },
        { label: 'Total Claims', value: '3,519' },
      ],
      followUps: ['Show monthly disruption trend', 'Break down by jurisdiction', 'Filter by airline'],
    };
  }

  // SLA / compliance
  if (q.includes('sla') || q.includes('compliance')) {
    const latestSla = analyticsData.slaComplianceData[analyticsData.slaComplianceData.length - 1];
    const trendData = analyticsData.slaComplianceData.map((d) => ({
      month: d.month.slice(0, 3),
      compliance: d.complianceRate,
    }));
    return {
      content:
        'SLA compliance has improved consistently from 89.7% in May 2025 to 96.3% in March 2026 — a 6.6 percentage-point gain. The team is now above the 95% target threshold and trending higher. December 2025 saw a temporary dip to 93.5%, coinciding with peak claim volumes, but performance recovered swiftly in Q1 2026.',
      chartType: 'gauge',
      gaugeValue: latestSla.complianceRate,
      gaugeTarget: 95,
      chartData: trendData,
      chartXKey: 'month',
      chartYKeys: ['compliance'],
      metrics: [
        { label: 'Current SLA Rate', value: `${latestSla.complianceRate}%`, highlight: true },
        { label: 'Target', value: '95%' },
        { label: 'Claims Breached (MTD)', value: `${latestSla.claimsBreached}` },
      ],
      followUps: ['Show by agent', 'View breach details', 'Compare last 6 months'],
    };
  }

  // Rejection / fraud
  if (q.includes('rejection') || q.includes('fraud') || q.includes('reject')) {
    const rejectionData = analyticsData.claimsByMonth.map((m) => ({
      month: m.month.slice(0, 3),
      rejected: m.rejected,
      returned: m.returned,
    }));
    return {
      content:
        'Rejection rates have remained stable at 15–16% across the 12-month period, with returned-for-information cases averaging 6.8% monthly. The combined rework rate (rejections + returns) peaked in December 2025 at 97 cases, broadly in line with the volume spike. Fraud flag rates are estimated at 2.1% of submitted claims based on AI confidence scoring.',
      chartType: 'bar',
      chartData: rejectionData,
      chartXKey: 'month',
      chartYKeys: ['rejected', 'returned'],
      metrics: [
        { label: 'Avg Rejection Rate', value: '15.8%', highlight: true },
        { label: 'Avg Return Rate', value: '6.8%' },
        { label: 'Est. Fraud Flag Rate', value: '2.1%' },
      ],
      followUps: ['Show rejection reasons', 'Flag high-risk claims', 'Compare by jurisdiction'],
    };
  }

  // Jurisdiction / region
  if (q.includes('jurisdiction') || q.includes('region') || q.includes('country')) {
    const donutData = analyticsData.claimsByJurisdiction.map((j) => ({
      name: j.jurisdiction,
      value: j.count,
    }));
    return {
      content:
        'India (DGCA) is the dominant jurisdiction at 41.4% of claims, reflecting Meridian\'s primary market. EU EC 261 claims carry the highest regulatory scrutiny and longest processing times at 5.1 days on average. US DOT claims are smallest in volume but take the longest at 6.3 days, likely due to documentation requirements.',
      chartType: 'donut',
      donutData,
      metrics: [
        { label: 'Largest Jurisdiction', value: 'India DGCA (41.4%)', highlight: true },
        { label: 'Slowest Processing', value: 'USA DOT (6.3 days)' },
        { label: 'Total Jurisdictions', value: '6' },
      ],
      followUps: ['Show payout by jurisdiction', 'Compliance by region', 'Processing time comparison'],
    };
  }

  // Processing time / average
  if (q.includes('processing') || q.includes('average') || q.includes('resolution')) {
    const trendData = analyticsData.slaComplianceData.map((d) => ({
      month: d.month.slice(0, 3),
      days: d.avgResolutionDays,
    }));
    return {
      content:
        'Average resolution time has improved from 4.1 days in May 2025 to 3.0 days in March 2026 — a 27% reduction. This improvement is attributed to increased straight-through processing and better document pre-validation. Sarah Chen processes claims fastest at 2.9 days average; Mohammed Al-Rashid at 4.1 days represents the longest cycle.',
      chartType: 'line',
      chartData: trendData,
      chartXKey: 'month',
      chartYKeys: ['days'],
      metrics: [
        { label: 'Current Avg Resolution', value: '3.0 days', highlight: true },
        { label: 'Improvement (12M)', value: '-27%' },
        { label: 'Fastest Agent', value: 'Sarah Chen (2.9d)' },
      ],
      followUps: ['Show by disruption type', 'SLA compliance trend', 'Agent comparison'],
    };
  }

  // Default / unknown
  return {
    content:
      'Here is a summary of key metrics across your claims operation. Total claims YTD stand at 1,120 with a 78% approval rate. Payouts have been trending upward with peak spend in December 2025. SLA compliance is strong at 96.3% and improving. Use the suggestions below to dig deeper into any area.',
    chartType: 'bar',
    chartData: analyticsData.claimsByMonth.slice(-6).map((m) => ({
      month: m.month.slice(0, 3),
      claims: m.claims,
    })),
    chartXKey: 'month',
    chartYKeys: ['claims'],
    metrics: [
      { label: 'Claims YTD', value: '1,120', highlight: true },
      { label: 'Approval Rate', value: '78%' },
      { label: 'SLA Compliance', value: '96.3%' },
    ],
    followUps: ['Total payout this quarter?', 'Top routes by claims?', 'SLA compliance rate'],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Typing indicator
// ─────────────────────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-full bg-[var(--color-brand-primary)] flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Metric callouts
// ─────────────────────────────────────────────────────────────────────────────

function MetricCallouts({ metrics }: { metrics: MetricCallout[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {metrics.map((m) => (
        <div
          key={m.label}
          className={cn(
            'flex flex-col px-3 py-2 rounded-lg border text-center min-w-[90px]',
            m.highlight
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
          )}
        >
          <span
            className={cn(
              'text-sm font-bold tabular-nums',
              m.highlight ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200',
            )}
          >
            {m.value}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Follow-up chips
// ─────────────────────────────────────────────────────────────────────────────

function FollowUpChips({ chips, onSelect }: { chips: string[]; onSelect: (q: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => onSelect(chip)}
          className={cn(
            'text-[11px] px-2.5 py-1 rounded-full border transition-all duration-150',
            'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300',
            'border-slate-200 dark:border-slate-700',
            'hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]',
            'dark:hover:border-[var(--color-brand-primary)] dark:hover:text-blue-400',
          )}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Message bubble
// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({ message, onFollowUp }: { message: Message; onFollowUp: (q: string) => void }) {
  const isUser = message.role === 'user';

  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className={cn(
            'max-w-[75%] px-4 py-2.5 rounded-[var(--radius-md)] text-sm',
            'bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)]',
            'dark:bg-[var(--color-brand-primary-surface)] dark:text-blue-200',
            'font-medium',
          )}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-full bg-[var(--color-brand-primary)] flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 min-w-0 max-w-[90%]">
        {/* AI response card with blue left accent */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] pl-4 pr-4 pt-3 pb-3 border-l-4 border-l-blue-400 dark:border-l-blue-500">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {renderContent(message.content)}
          </p>

          {/* Metric callouts */}
          {message.metrics && message.metrics.length > 0 && (
            <MetricCallouts metrics={message.metrics} />
          )}
        </div>

        {/* Chart (outside the card, below) */}
        {message.chartType === 'bar' && message.chartData && (
          <div className="mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-3 overflow-hidden">
            <div className="h-[300px] w-full">
              <BarChart
                data={message.chartData}
                xKey={message.chartXKey ?? 'x'}
                yKeys={message.chartYKeys ?? ['y']}
                height={300}
                showGrid
                stacked={message.chartYKeys && message.chartYKeys.length > 1}
              />
            </div>
          </div>
        )}

        {message.chartType === 'line' && message.chartData && (
          <div className="mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-3 overflow-hidden">
            <div className="h-[300px] w-full">
              <LineChart
                data={message.chartData}
                xKey={message.chartXKey ?? 'x'}
                yKeys={message.chartYKeys ?? ['y']}
                height={300}
              />
            </div>
          </div>
        )}

        {message.chartType === 'donut' && message.donutData && (
          <div className="mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-3 overflow-hidden">
            <div className="h-[300px] w-full">
              <DonutChart
                data={message.donutData}
                centerLabel="Total"
                centerValue={message.donutData.reduce((a, b) => a + b.value, 0)}
                showLegend
                height={300}
              />
            </div>
          </div>
        )}

        {message.chartType === 'gauge' && message.gaugeValue !== undefined && (
          <div className="mt-2 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-3 overflow-hidden flex flex-col items-center">
              <div className="h-[180px] w-full flex items-center justify-center">
                <GaugeChart
                  value={message.gaugeValue}
                  target={message.gaugeTarget ?? 95}
                  label="SLA Compliance"
                  colorZones={[
                    { start: 0, end: 80, color: '#EF4444' },
                    { start: 80, end: 90, color: '#F59E0B' },
                    { start: 90, end: 100, color: '#10B981' },
                  ]}
                />
              </div>
            </div>
            {/* Trend line for SLA in separate container */}
            {message.chartData && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-3 overflow-hidden">
                <div className="h-[180px] w-full">
                  <LineChart
                    data={message.chartData}
                    xKey={message.chartXKey ?? 'x'}
                    yKeys={message.chartYKeys ?? ['y']}
                    height={180}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Follow-up chips */}
        {message.followUps && message.followUps.length > 0 && (
          <FollowUpChips chips={message.followUps} onSelect={onFollowUp} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-loaded welcome state (no messages, clean start)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function TalkToData({ className }: TalkToDataProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Only scroll WITHIN the chat container — never touch the page scroll
  useEffect(() => {
    if (chatRef.current && (messages.length > 0 || isTyping)) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Realistic 1–2 second delay
    const delay = 1000 + Math.random() * 800;
    setTimeout(() => {
      const response = generateResponse(text.trim());
      const assistantMsg: Message = {
        id: `msg-${Date.now()}-reply`,
        role: 'assistant',
        ...response,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-slate-50 dark:bg-slate-950 rounded-[var(--radius-lg)] border border-slate-200 dark:border-slate-700 overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-primary)] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Talk to Data</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">AI-powered analytics assistant</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0"
      >
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-primary-light)] dark:bg-[var(--color-brand-primary-surface)] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[var(--color-brand-primary)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ask Meridian anything
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Get instant insights from your claims data — charts, metrics, and analysis
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onFollowUp={sendMessage} />
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggested queries — shown only when no messages yet */}
      {!isTyping && messages.length === 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2 shrink-0">
          {SUGGESTED_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendMessage(q)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-all duration-150',
                'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300',
                'border-slate-200 dark:border-slate-700',
                'hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]',
                'dark:hover:border-[var(--color-brand-primary)] dark:hover:text-blue-400',
              )}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 shrink-0 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 h-[52px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-lg)] px-4 shadow-[var(--shadow-xs)] focus-within:border-[var(--color-brand-primary)] transition-colors">
          <Sparkles className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your data…"
            disabled={isTyping}
            className={cn(
              'flex-1 text-sm bg-transparent border-none outline-none',
              'text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'disabled:opacity-60',
            )}
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className={cn(
              'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150',
              input.trim() && !isTyping
                ? 'bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)] active:scale-95'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed',
            )}
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TalkToData;

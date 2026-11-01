import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Dropdown from '@/components/ui/Dropdown';
import Skeleton from '@/components/ui/Skeleton';
import { DATE_RANGES, CATEGORY_COLOR, type Category } from '@/lib/constants';
import { formatINR } from '@/lib/format';
import { useSpendingBreakdown } from '@/hooks/useAnalytics';
import { TrendingDown, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const [range, setRange] = useState<string>('1M');
  const { data: breakdown, isLoading } = useSpendingBreakdown(range);

  const total = breakdown?.reduce((s, b) => s + b.amount, 0) || 0;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Where your money actually goes."
        actions={
          <Dropdown
            options={DATE_RANGES.map((r) => ({ label: r, value: r }))}
            value={range}
            onChange={setRange}
          />
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Spending Distribution */}
        <Card className="p-5 lg:col-span-2 border-border-subtle bg-surface">
          <p className="mb-5 label-caps">Spending Distribution</p>
          {isLoading && <Skeleton className="h-64 w-full" />}
          {breakdown && breakdown.length === 0 && (
            <p className="py-12 text-center text-sm text-ink-tertiary">No expenses in this range yet.</p>
          )}
          {breakdown && breakdown.length > 0 && (
            <div className="space-y-4">
              {/* Stacked bar */}
              <div className="flex h-3 overflow-hidden rounded bg-elevated">
                {breakdown.map((b) => (
                  <div
                    key={b.category}
                    style={{
                      width: `${b.percentage}%`,
                      backgroundColor: CATEGORY_COLOR[b.category as Category] || '#8B909C',
                    }}
                    className="transition-all duration-700"
                  />
                ))}
              </div>

              {/* Category breakdown rows */}
              <div className="space-y-2 pt-2">
                {breakdown.map((b) => (
                  <div
                    key={b.category}
                    className="flex items-center justify-between rounded px-3 py-2.5 transition-colors hover:bg-elevated border border-transparent hover:border-border-strong"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLOR[b.category as Category] || '#8B909C' }}
                      />
                      <span className="text-sm font-medium text-ink-primary">{b.category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-ink-tertiary">{b.percentage}%</span>
                      <span className="num text-sm font-semibold text-ink-primary min-w-[80px] text-right">
                        {formatINR(b.amount)}
                      </span>
                      {b.changePercent != null && (
                        <div
                          className="flex items-center gap-1 text-[11px] font-bold tracking-wide"
                          style={{ color: b.changePercent > 0 ? '#f0526b' : '#00d4b4' }}
                        >
                          {b.changePercent > 0
                            ? <TrendingUp size={11} />
                            : <TrendingDown size={11} />
                          }
                          {Math.abs(b.changePercent)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Insights */}
        <Card className="p-5 border-border-subtle bg-surface">
          <p className="mb-5 label-caps">Insights</p>
          {breakdown && total > 0 ? (
            <ul className="space-y-3">
              {breakdown.slice(0, 5).map((b) => (
                <li
                  key={b.category}
                  className="rounded p-3 bg-elevated border border-border-strong"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLOR[b.category as Category] || '#8B909C' }}
                    />
                    <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">{b.category}</span>
                  </div>
                  <p className="text-xs text-ink-tertiary leading-relaxed mt-1">
                    {b.changePercent == null
                      ? 'No prior period to compare.'
                      : b.changePercent > 0
                      ? `↑ Increased ${b.changePercent}% vs. prior period.`
                      : `↓ Decreased ${Math.abs(b.changePercent)}% vs. prior period.`}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-tertiary">Add a few transactions to see insights here.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

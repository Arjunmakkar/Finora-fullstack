import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from 'recharts';
import TiltCard from '@/components/ui/TiltCard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import Skeleton from '@/components/ui/Skeleton';

import { DATE_RANGES } from '@/lib/constants';
import { formatINR, formatDate } from '@/lib/format';
import {
  useDashboardSummary,
  useCashFlow,
  useSpendingBreakdown,
} from '@/hooks/useAnalytics';
import { useTransactions } from '@/hooks/useTransactions';
import { Plus, ArrowRight, Target } from 'lucide-react';

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[4px] border border-[#262626] bg-[#0A0A0A] p-2.5 text-12 shadow-elevated">
      <p className="text-[#8A8A8A] mb-1 font-mono">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.stroke || p.color }}
          />
          <span className="text-[#8A8A8A]">{p.name}:</span>
          <span className="font-medium text-[#F5F5F5] num">
            {formatINR(Math.round((p.value ?? 0) * 100))}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [range, setRange] = useState<(typeof DATE_RANGES)[number]>('1M');

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: cashFlow, isLoading: cashFlowLoading } = useCashFlow();
  const { data: breakdown, isLoading: breakdownLoading } = useSpendingBreakdown(range);
  const { data: recentTx, isLoading: txLoading } = useTransactions({ sort: 'date_desc' });

  const isEmpty = !summaryLoading && (!recentTx || recentTx.length === 0);

  // Pre-process cash flow data (converting paise to rupees strictly for the chart coordinate scale)
  const chartData = cashFlow?.map((c) => ({
    month: c.month,
    incomeRupees: c.income / 100,
    expensesRupees: c.expenses / 100,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Top Value Headline */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-[#262626] pb-5">
        <div>
          <h1 className="font-display text-32 font-bold text-[#F5F5F5] tracking-tight">
            See where your money goes this month
          </h1>
          <p className="mt-1 text-14 text-[#8A8A8A]">
            Overview of cash flow, category allocations, and verified balances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/budgets">
            <Button variant="secondary" size="sm">
              <Target size={14} /> Set budget
            </Button>
          </Link>
          <Link to="/transactions">
            <Button size="sm">
              <Plus size={14} /> Add transaction
            </Button>
          </Link>
        </div>
      </div>

      {isEmpty ? (
        <Card className="flex flex-col items-center justify-center py-20 px-6 text-center border border-[#262626] bg-[#111111]">
          <div className="mb-4 h-px w-12 bg-[#D4FF3A]" />
          <h2 className="font-display text-20 font-bold text-[#F5F5F5] mb-2">
            No financial records found
          </h2>
          <p className="text-14 text-[#8A8A8A] max-w-md mb-6 leading-relaxed">
            Record your initial income or recurring expenses to unlock deterministic cash flow analysis and category allocations.
          </p>
          <Link to="/transactions">
            <Button size="md">
              <Plus size={14} /> Add transaction
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* TOP ROW: Exactly 4 Cards with 3D Tilt Effect (Max 6 degrees per FINORA rules) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Net worth */}
            <TiltCard maxTilt={6}>
              <p className="text-12 font-medium text-[#8A8A8A]">Net worth</p>
              {summaryLoading || !summary ? (
                <Skeleton className="h-10 w-36 mt-2 bg-[#161616]" />
              ) : (
                <p className="num font-display text-32 font-bold text-[#F5F5F5] mt-1 tracking-tight">
                  {formatINR(summary.netWorth)}
                </p>
              )}
              <p className="mt-2 text-12 text-[#8A8A8A]">Total verified balance</p>
            </TiltCard>

            {/* 2. Monthly income */}
            <TiltCard maxTilt={6}>
              <p className="text-12 font-medium text-[#8A8A8A]">Monthly income</p>
              {summaryLoading || !summary ? (
                <Skeleton className="h-10 w-36 mt-2 bg-[#161616]" />
              ) : (
                <p className="num font-display text-32 font-bold text-[#F5F5F5] mt-1 tracking-tight">
                  +{formatINR(summary.monthlyIncome)}
                </p>
              )}
              <p className="mt-2 text-12 text-[#8A8A8A]">Current calendar month</p>
            </TiltCard>

            {/* 3. Monthly spend */}
            <TiltCard maxTilt={6}>
              <p className="text-12 font-medium text-[#8A8A8A]">Monthly spend</p>
              {summaryLoading || !summary ? (
                <Skeleton className="h-10 w-36 mt-2 bg-[#161616]" />
              ) : (
                <p className="num font-display text-32 font-bold text-[#F5F5F5] mt-1 tracking-tight">
                  −{formatINR(summary.monthlyExpenses)}
                </p>
              )}
              <p className="mt-2 text-12 text-[#8A8A8A]">Total debits & expenses</p>
            </TiltCard>

            {/* 4. Savings rate (Single accent highlight on the key efficiency metric) */}
            <TiltCard maxTilt={6}>
              <p className="text-12 font-medium text-[#8A8A8A]">Savings rate</p>
              {summaryLoading || !summary ? (
                <Skeleton className="h-10 w-24 mt-2 bg-[#161616]" />
              ) : (
                <p className="num font-display text-32 font-bold text-[#D4FF3A] mt-1 tracking-tight">
                  {summary.savingsRate ?? 0}%
                </p>
              )}
              <p className="mt-2 text-12 text-[#8A8A8A]">Retained of monthly income</p>
            </TiltCard>
          </div>

          {/* MIDDLE ROW: 6-Month Cash Flow Line Chart & Spending by Category (Horizontal Bars) */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* 6-Month Cash Flow Line Chart */}
            <Card className="p-5 lg:col-span-3 border border-[#262626] bg-[#111111]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-14 font-semibold text-[#F5F5F5]">6-month cash flow</h2>
                  <p className="text-12 text-[#8A8A8A]">Monochrome comparison of income vs expenses</p>
                </div>
                {/* Visual Series Legend with Text Labels */}
                <div className="flex items-center gap-4 text-12 font-medium text-[#8A8A8A]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 bg-[#F5F5F5]" />
                    <span className="text-[#F5F5F5]">Income</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 border-t border-dashed border-[#8A8A8A]" />
                    <span>Spend</span>
                  </div>
                </div>
              </div>

              {/* Screen reader summary */}
              <div className="sr-only">
                6-month cash flow line chart. Solid white line represents income. Dashed gray line represents spend.
              </div>

              <div className="h-56 w-full min-w-0 overflow-hidden">
                {cashFlowLoading ? (
                  <Skeleton className="h-full w-full bg-[#161616]" />
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0}>
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#8A8A8A"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#8A8A8A"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                      />
                      <RTooltip content={<ChartTooltip />} />
                      {/* White for primary series (Income) */}
                      <Line
                        type="monotone"
                        dataKey="incomeRupees"
                        name="Income"
                        stroke="#F5F5F5"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#F5F5F5', strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#D4FF3A' }}
                      />
                      {/* Gray dashed line for secondary series (Spend) */}
                      <Line
                        type="monotone"
                        dataKey="expensesRupees"
                        name="Spend"
                        stroke="#8A8A8A"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={{ r: 3, fill: '#8A8A8A', strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#F5F5F5' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-12 text-[#8A8A8A]">
                    No historical cash flow data recorded.
                  </div>
                )}
              </div>
            </Card>

            {/* Spending by Category (Horizontal Bars, NOT Pie Charts per FINORA Rules) */}
            <Card className="p-5 lg:col-span-2 border border-[#262626] bg-[#111111] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-14 font-semibold text-[#F5F5F5]">Spending by category</h2>
                    <p className="text-12 text-[#8A8A8A]">Proportional distribution</p>
                  </div>
                  <Dropdown
                    options={DATE_RANGES.map((r) => ({ label: r, value: r }))}
                    value={range}
                    onChange={(v) => setRange(v as any)}
                  />
                </div>

                {/* Screen reader summary */}
                <div className="sr-only">
                  Horizontal bar chart of spending by category, listing categories with amounts and percentages.
                </div>

                <div className="space-y-3.5">
                  {breakdownLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-1.5">
                        <Skeleton className="h-4 w-32 bg-[#161616]" />
                        <Skeleton className="h-2 w-full bg-[#161616]" />
                      </div>
                    ))
                  ) : breakdown && breakdown.length > 0 ? (
                    breakdown.slice(0, 5).map((b, idx) => {
                      const isTopCategory = idx === 0;
                      return (
                        <div key={b.category}>
                          <div className="flex items-center justify-between text-12 mb-1.5">
                            <span className="font-medium text-[#F5F5F5]">{b.category}</span>
                            <span className="num text-[#8A8A8A]">
                              {formatINR(b.amount)} ({b.percentage}%)
                            </span>
                          </div>
                          {/* Horizontal Bar */}
                          <div className="h-1.5 w-full bg-[#161616] rounded-[1px] overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-[1px] ${
                                isTopCategory ? 'bg-[#D4FF3A]' : 'bg-[#8A8A8A]'
                              }`}
                              style={{ width: `${Math.min(100, b.percentage)}%` }}
                              role="progressbar"
                              aria-valuenow={b.percentage}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${b.category}: ${b.percentage}%`}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-12 text-[#8A8A8A]">
                      No category spending recorded for this range.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#262626]">
                <Link
                  to="/analytics"
                  className="flex items-center justify-between text-12 font-medium text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors"
                >
                  <span>Explore full financial analytics</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </Card>
          </div>

          {/* BOTTOM ROW: Most Recent 8 Transactions (Dense Table per Rules) */}
          <Card className="border border-[#262626] bg-[#111111] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#262626] bg-[#0A0A0A]">
              <div>
                <h2 className="text-14 font-semibold text-[#F5F5F5]">Recent transactions</h2>
                <p className="text-12 text-[#8A8A8A]">Latest 8 posted ledger entries</p>
              </div>
              <Link to="/transactions">
                <Button variant="secondary" size="sm">
                  View all transactions
                </Button>
              </Link>
            </div>

            {/* Dense Table View (Desktop & Tablet) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-14" aria-label="Recent transactions table">
                <thead>
                  <tr className="border-b border-[#262626] bg-[#0A0A0A] text-12 font-medium text-[#8A8A8A]">
                    <th scope="col" className="px-4 py-2 w-32">Date</th>
                    <th scope="col" className="px-4 py-2">Merchant / Description</th>
                    <th scope="col" className="px-4 py-2 w-36">Category</th>
                    <th scope="col" className="px-4 py-2 w-28">Account</th>
                    <th scope="col" className="px-4 py-2 text-right w-36">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {txLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="h-10">
                        <td colSpan={5} className="px-4 py-2">
                          <Skeleton className="h-6 w-full bg-[#161616]" />
                        </td>
                      </tr>
                    ))
                  ) : recentTx?.slice(0, 8).map((tx) => {
                    const isIncome = tx.type === 'INCOME';
                    return (
                      <tr
                        key={tx.id}
                        className="h-10 transition-colors duration-100 hover:bg-[#161616]"
                      >
                        <td className="px-4 py-2 whitespace-nowrap text-12 text-[#8A8A8A] font-mono">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-4 py-2 truncate max-w-sm">
                          <span className="font-medium text-[#F5F5F5]">{tx.merchant || tx.description}</span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-12 text-[#8A8A8A]">
                          <span className="inline-block rounded-[2px] bg-[#161616] border border-[#262626] px-2 py-0.5 text-12 text-[#F5F5F5]">
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-12 text-[#8A8A8A] font-mono">
                          ••••4921
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          {/* Positive and negative distinguished by sign and weight */}
                          <span
                            className={`num text-14 ${
                              isIncome ? 'font-semibold text-[#F5F5F5]' : 'font-normal text-[#8A8A8A]'
                            }`}
                          >
                            {isIncome ? '+' : '−'}
                            {formatINR(tx.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Stacked Cards */}
            <div className="md:hidden divide-y divide-[#262626]">
              {txLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-3.5">
                    <Skeleton className="h-10 w-full bg-[#161616]" />
                  </div>
                ))
              ) : recentTx?.slice(0, 8).map((tx) => {
                const isIncome = tx.type === 'INCOME';
                return (
                  <div key={tx.id} className="p-3.5 hover:bg-[#161616] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-14 text-[#F5F5F5] truncate">
                          {tx.merchant || tx.description}
                        </p>
                        <p className="text-12 text-[#8A8A8A] mt-0.5 font-mono">
                          {formatDate(tx.date)} • {tx.category} • ••••4921
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`num text-14 tabular-nums ${
                            isIncome ? 'font-semibold text-[#F5F5F5]' : 'font-normal text-[#8A8A8A]'
                          }`}
                        >
                          {isIncome ? '+' : '−'}
                          {formatINR(tx.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

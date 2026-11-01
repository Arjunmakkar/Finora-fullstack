import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import Skeleton from '@/components/ui/Skeleton';
import AddTransactionModal from '@/components/finance/AddTransactionModal';
import TransactionDrawer from '@/components/finance/TransactionDrawer';
import { Plus, Search, Download } from 'lucide-react';
import { CATEGORIES, DATE_RANGES } from '@/lib/constants';
import { formatINR, formatDate } from '@/lib/format';
import { useTransactions } from '@/hooks/useTransactions';
import type { Transaction } from '@/types';

const SORT_OPTIONS = [
  { label: 'Newest first', value: 'date_desc' },
  { label: 'Oldest first', value: 'date_asc' },
  { label: 'Amount high-low', value: 'amount_desc' },
  { label: 'Amount low-high', value: 'amount_asc' },
];

export default function Transactions() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [range, setRange] = useState<string>('3M');
  const [sort, setSort] = useState('date_desc');

  const { data: transactions, isLoading } = useTransactions({ search, category, range, sort });

  const exportCSV = () => {
    if (!transactions?.length) return;
    const headers = ['Date', 'Merchant', 'Description', 'Category', 'Type', 'Amount (Paise)', 'Account'];
    const rows = transactions.map((t) => [
      formatDate(t.date),
      `"${t.merchant || ''}"`,
      `"${t.description || ''}"`,
      `"${t.category || ''}"`,
      t.type,
      t.amount,
      '••••4921',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `finora_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Transactions"
        description="Every rupee in and out, recorded in integer paise."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={exportCSV} disabled={!transactions?.length}>
              <Download size={14} /> Export CSV
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} id="add-transaction-btn">
              <Plus size={14} /> Add transaction
            </Button>
          </div>
        }
      />

      <Card className="overflow-hidden border border-[#262626] bg-[#111111]">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2.5 p-3.5 border-b border-[#262626] bg-[#0A0A0A]">
          <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-[4px] px-3 py-1.5 text-14 bg-[#111111] border border-[#262626]">
            <Search size={14} className="text-[#8A8A8A] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description or merchant..."
              className="w-full bg-transparent text-[#F5F5F5] outline-none placeholder:text-[#8A8A8A] text-14"
            />
          </div>
          <Dropdown
            options={[{ label: 'All categories', value: 'All' }, ...CATEGORIES.map((c) => ({ label: c, value: c }))]}
            value={category}
            onChange={setCategory}
          />
          <Dropdown options={DATE_RANGES.map((r) => ({ label: r, value: r }))} value={range} onChange={setRange} />
          <Dropdown options={SORT_OPTIONS} value={sort} onChange={setSort} />
        </div>

        {/* Dense Table View (Desktop & Tablet) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-left text-14" aria-label="Transactions table">
            <thead>
              <tr className="border-b border-[#262626] bg-[#0A0A0A] text-12 font-medium text-[#8A8A8A]">
                <th scope="col" className="px-4 py-2.5 w-32">Date</th>
                <th scope="col" className="px-4 py-2.5">Merchant / Description</th>
                <th scope="col" className="px-4 py-2.5 w-36">Category</th>
                <th scope="col" className="px-4 py-2.5 w-28">Account</th>
                <th scope="col" className="px-4 py-2.5 text-right w-36">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="h-10">
                    <td colSpan={5} className="px-4 py-2">
                      <Skeleton className="h-6 w-full bg-[#161616]" />
                    </td>
                  </tr>
                ))}

              {!isLoading && transactions?.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <p className="text-14 text-[#8A8A8A] mb-3">No transactions match those filters.</p>
                    <Button size="sm" onClick={() => setModalOpen(true)}>
                      <Plus size={14} /> Add transaction
                    </Button>
                  </td>
                </tr>
              )}

              {transactions?.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                return (
                  <tr
                    key={tx.id}
                    onClick={() => setSelected(tx)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelected(tx);
                    }}
                    className="h-10 cursor-pointer transition-colors duration-100 hover:bg-[#161616] focus-visible:bg-[#161616] outline-none"
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-12 text-[#8A8A8A] font-mono">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-4 py-2 truncate max-w-md">
                      <span className="font-medium text-[#F5F5F5]">{tx.merchant || tx.description}</span>
                      {tx.merchant && tx.description && tx.merchant !== tx.description && (
                        <span className="ml-2 text-12 text-[#8A8A8A] truncate">({tx.description})</span>
                      )}
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
                      {/* Positive and negative distinguished by sign and weight, not red/green */}
                      <span
                        className={`num text-14 ${
                          isIncome
                            ? 'font-semibold text-[#F5F5F5]'
                            : 'font-normal text-[#8A8A8A]'
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

        {/* Mobile View: Stacked cards with amount on top right and merchant on left */}
        <div className="md:hidden divide-y divide-[#262626]">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3">
                <Skeleton className="h-12 w-full bg-[#161616]" />
              </div>
            ))}

          {!isLoading && transactions?.length === 0 && (
            <div className="py-12 px-4 text-center">
              <p className="text-14 text-[#8A8A8A] mb-3">No transactions match those filters.</p>
              <Button size="sm" onClick={() => setModalOpen(true)}>
                <Plus size={14} /> Add transaction
              </Button>
            </div>
          )}

          {transactions?.map((tx) => {
            const isIncome = tx.type === 'INCOME';
            return (
              <div
                key={tx.id}
                onClick={() => setSelected(tx)}
                className="p-3.5 transition-colors hover:bg-[#161616] cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-14 text-[#F5F5F5] truncate">
                      {tx.merchant || tx.description}
                    </p>
                    <p className="text-12 text-[#8A8A8A] mt-0.5">
                      {formatDate(tx.date)} • {tx.category} • ••••4921
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`num text-14 ${
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

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <TransactionDrawer transaction={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

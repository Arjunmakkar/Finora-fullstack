import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { formatINR } from '@/lib/format';
import { useBudgets, useSaveBudget, useDeleteBudget } from '@/hooks/useBudgets';
import { apiErrorMessage } from '@/lib/api/client';

function statusConfig(pct: number) {
  if (pct >= 100) return { text: 'OVER BUDGET', color: '#f0526b', bg: '#1a1c29', border: '#2a2d40', bar: '#f0526b' };
  if (pct >= 90) return { text: 'ALMOST AT LIMIT', color: '#f0a93a', bg: '#1a1c29', border: '#2a2d40', bar: '#f0a93a' };
  if (pct >= 75) return { text: 'WATCH SPENDING', color: '#f0a93a', bg: '#1a1c29', border: '#2a2d40', bar: '#f0a93a' };
  return { text: 'ON TRACK', color: '#00d4b4', bg: '#1a1c29', border: '#2a2d40', bar: '#00d4b4' };
}

export default function Budgets() {
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [limitAmount, setLimitAmount] = useState('');

  const { data: budgets, isLoading } = useBudgets();
  const save = useSaveBudget();
  const del = useDeleteBudget();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save.mutateAsync({ category, limitAmount: Number(limitAmount) });
      setLimitAmount('');
      setModalOpen(false);
    } catch {
      // shown inline
    }
  };

  return (
    <div>
      <PageHeader
        title="Budgets"
        description="Monthly limits by category, with early warnings."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)} id="add-budget-btn">
            <Plus size={14} /> New budget
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)}

        {!isLoading && budgets?.length === 0 && (
          <Card className="col-span-2 flex h-48 flex-col items-center justify-center gap-3 border-border-subtle bg-surface">
            <div
              className="h-12 w-12 rounded flex items-center justify-center bg-elevated border border-border-strong"
            >
              <Plus size={20} className="text-ink-tertiary" />
            </div>
            <p className="text-sm text-ink-tertiary">No budgets yet — add one to start tracking limits.</p>
          </Card>
        )}

        {budgets?.map((b) => {
          const s = statusConfig(b.percentUsed);
          return (
            <Card key={b.id} className="p-5 group border-border-subtle bg-surface transition-colors hover:border-border-strong">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="font-display text-base font-semibold text-ink-primary">{b.category}</p>
                  <p className="mt-0.5 text-xs text-ink-tertiary num">
                    {formatINR(b.spent)} <span className="text-ink-secondary">/ {formatINR(b.limitAmount)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="rounded px-2 py-1 text-[10px] font-bold tracking-wider uppercase border"
                    style={{ background: s.bg, color: s.color, borderColor: s.border }}
                  >
                    {s.text}
                  </div>
                  <button
                    onClick={() => del.mutate(b.id)}
                    className="rounded p-1.5 text-ink-tertiary hover:text-accent-rose hover:bg-elevated transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete budget"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-[3px] w-full bg-elevated">
                <div
                  className="h-[3px] transition-all duration-700"
                  style={{
                    width: `${Math.min(100, b.percentUsed)}%`,
                    background: s.bar,
                  }}
                />
              </div>

              <div className="mt-2.5 flex justify-between text-[11px] font-bold tracking-wide uppercase">
                <span style={{ color: s.color }}>{Math.round(b.percentUsed)}% used</span>
                <span className="text-ink-tertiary">{Math.round(100 - Math.min(100, b.percentUsed))}% remaining</span>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New budget">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-2 block text-xs font-medium text-ink-secondary">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select-field"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-ink-secondary">Monthly limit (₹)</label>
            <input
              required
              type="number"
              min="0"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="input-field"
              placeholder="10000"
            />
          </div>
          {save.isError && (
            <div className="flex items-center gap-2 rounded px-3 py-2 text-xs text-accent-rose bg-elevated border border-border-strong">
              <AlertTriangle size={12} />
              {apiErrorMessage(save.error)}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={save.isPending} id="save-budget-btn">
            {save.isPending ? 'Saving...' : 'Save budget'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

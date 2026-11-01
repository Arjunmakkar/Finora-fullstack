import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { Plus, Trash2, Target, CheckCircle2 } from 'lucide-react';
import { formatINR, formatDate } from '@/lib/format';
import { useGoals, useCreateGoal, useDeleteGoal } from '@/hooks/useGoals';
import { apiErrorMessage } from '@/lib/api/client';

function ProgressRing({ percent, onTrack }: { percent: number; onTrack: boolean }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, percent) / 100) * c;
  const color = onTrack ? '#00d4b4' : '#f0a93a';

  return (
    <svg viewBox="0 0 80 80" width="76" height="76">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#1a1c29" strokeWidth="8" />
      <circle
        cx="40" cy="40" r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 40 40)"
        style={{ transition: 'stroke-dashoffset 0.7s ease' }}
      />
      <text x="40" y="45" textAnchor="middle" fill="#F2F3F5" fontFamily="Outfit" fontSize="14" fontWeight="700">
        {percent}%
      </text>
    </svg>
  );
}

export default function Goals() {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [deadline, setDeadline] = useState('');

  const { data: goals, isLoading } = useGoals();
  const create = useCreateGoal();
  const del = useDeleteGoal();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({ name, targetAmount: Number(targetAmount), monthlyContribution: Number(monthlyContribution), deadline });
      setName(''); setTargetAmount(''); setMonthlyContribution(''); setDeadline('');
      setModalOpen(false);
    } catch { }
  };

  return (
    <div>
      <PageHeader
        title="Financial Goals"
        description="Track progress toward what matters."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)} id="add-goal-btn">
            <Plus size={14} /> New goal
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52" />)}

        {!isLoading && goals?.length === 0 && (
          <Card className="col-span-3 flex h-52 flex-col items-center justify-center gap-3 border-border-subtle bg-surface">
            <div
              className="h-12 w-12 rounded flex items-center justify-center bg-elevated border border-border-strong"
            >
              <Target size={20} className="text-ink-tertiary" />
            </div>
            <p className="text-sm text-ink-tertiary">No goals yet — add one to start tracking progress.</p>
          </Card>
        )}

        {goals?.map((g) => (
          <Card key={g.id} className="p-5 group border-border-subtle bg-surface transition-colors hover:border-border-strong">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded flex items-center justify-center bg-elevated border border-border-strong"
                >
                  {g.onTrack
                    ? <CheckCircle2 size={16} className="text-accent-teal" />
                    : <Target size={16} style={{ color: '#f0a93a' }} />
                  }
                </div>
                <p className="font-display text-sm font-semibold text-ink-primary">{g.name}</p>
              </div>
              <button
                onClick={() => del.mutate(g.id)}
                className="rounded p-1.5 text-ink-tertiary hover:text-accent-rose hover:bg-elevated transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Delete goal"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex items-center gap-5">
              <ProgressRing percent={g.progressPercent} onTrack={g.onTrack} />
              <div>
                <p className="num font-display text-xl font-bold text-ink-primary">{formatINR(g.savedAmount)}</p>
                <p className="text-[11px] uppercase tracking-wide font-bold text-ink-tertiary mt-1">OF {formatINR(g.targetAmount)}</p>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-ink-tertiary mt-1">DEADLINE {formatDate(g.deadline)}</p>
              </div>
            </div>

            <div
              className="mt-5 rounded px-3 py-2 text-[10px] tracking-wider uppercase font-bold border"
              style={{
                background: '#1a1c29',
                borderColor: '#2a2d40',
                color: g.onTrack ? '#00d4b4' : '#f0a93a',
              }}
            >
              {g.onTrack
                ? '✓ ON TRACK AT CURRENT RATE'
                : `↑ BUMP TO ${formatINR(g.requiredMonthly)}/MO TO HIT DEADLINE`}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New goal">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-2 block text-xs font-medium text-ink-secondary">Goal name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Emergency Fund" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-ink-secondary">Target (₹)</label>
              <input required type="number" min="0" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="input-field" placeholder="300000" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-ink-secondary">Monthly (₹)</label>
              <input required type="number" min="0" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} className="input-field" placeholder="10000" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-ink-secondary">Deadline</label>
            <input required type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input-field" />
          </div>
          {create.isError && <p className="text-xs text-accent-rose">{apiErrorMessage(create.error)}</p>}
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? 'Creating...' : 'Create goal'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

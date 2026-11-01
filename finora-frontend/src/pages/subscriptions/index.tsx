import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { Plus, Trash2, RefreshCw, Clock } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { formatINR, formatDate } from '@/lib/format';
import { useSubscriptions, useCreateSubscription, useDeleteSubscription } from '@/hooks/useSubscriptions';
import { apiErrorMessage } from '@/lib/api/client';

const cycleColors: Record<string, { color: string }> = {
  WEEKLY: { color: '#8A8A8A' },
  MONTHLY: { color: '#D4FF3A' },
  YEARLY: { color: '#F5F5F5' },
};

export default function Subscriptions() {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState<'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [nextPayment, setNextPayment] = useState('');
  const [category, setCategory] = useState('Subscriptions');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, isLoading } = useSubscriptions();
  const create = useCreateSubscription();
  const del = useDeleteSubscription();

  const handleOpenModal = () => {
    setSubmitError(null);
    setModalOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await create.mutateAsync({ name, price: Number(price), billingCycle, nextPayment, category });
      setName('');
      setPrice('');
      setNextPayment('');
      setModalOpen(false);
    } catch (err) {
      setSubmitError(apiErrorMessage(err));
    }
  };

  const daysUntil = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Recurring costs, monthly and annual totals."
        actions={
          <Button size="sm" onClick={handleOpenModal} id="add-subscription-btn">
            <Plus size={14} /> Add subscription
          </Button>
        }
      />

      {/* Summary */}
      {data && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Monthly total', value: formatINR(data.monthlyTotal), isAccent: true },
            { label: 'Annual total', value: formatINR(data.annualTotal), isAccent: false },
          ].map((s) => (
            <Card key={s.label} className="p-4 border border-[#262626] bg-[#111111]">
              <div className="mb-2 flex items-center gap-2">
                <RefreshCw size={12} className={s.isAccent ? 'text-[#D4FF3A]' : 'text-[#8A8A8A]'} />
                <p className="text-12 font-mono uppercase tracking-wider text-[#8A8A8A]">{s.label}</p>
              </div>
              <p
                className={`num font-display text-20 font-bold tabular-nums ${
                  s.isAccent ? 'text-[#D4FF3A]' : 'text-[#F5F5F5]'
                }`}
              >
                {s.value}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* List */}
      <Card className="overflow-hidden border border-[#262626] bg-[#111111]">
        {isLoading && (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full bg-[#1C1C1C]" />)}
          </div>
        )}
        {!isLoading && data?.subscriptions.length === 0 && (
          <p className="py-16 text-center text-14 text-[#8A8A8A]">No subscriptions tracked yet.</p>
        )}
        <div className="divide-y divide-[#262626]">
          {data?.subscriptions.map((s) => {
            const days = daysUntil(s.nextPayment);
            const c = cycleColors[s.billingCycle] || cycleColors.MONTHLY;
            const urgent = days <= 7;
            return (
              <div key={s.id} className="group flex items-center justify-between px-5 py-4 hover:bg-[#151515] transition-colors">
                <div className="flex items-center gap-4">
                  <div
                    className="h-9 w-9 rounded-[2px] flex items-center justify-center shrink-0 bg-[#0A0A0A] border border-[#262626]"
                  >
                    <RefreshCw size={14} style={{ color: c.color }} />
                  </div>
                  <div>
                    <p className="text-14 font-medium text-[#F5F5F5]">{s.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="rounded-[2px] px-1.5 py-0.5 text-12 font-mono font-bold tracking-wider uppercase border border-[#262626] bg-[#161616]"
                        style={{ color: c.color }}
                      >
                        {s.billingCycle}
                      </span>
                      <span className="text-12 font-mono uppercase tracking-wider text-[#8A8A8A]">{s.category}</span>
                      <span className="text-12 font-mono uppercase tracking-wider text-[#8A8A8A]">· NEXT {formatDate(s.nextPayment)}</span>
                      {urgent && (
                        <span className="flex items-center gap-1 text-12 font-mono uppercase tracking-wider font-bold text-[#D4FF3A]">
                          <Clock size={11} /> {days}D
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="num text-14 font-semibold text-[#F5F5F5] tabular-nums">{formatINR(s.price)}</p>
                  <button
                    onClick={() => del.mutate(s.id)}
                    className="rounded-[2px] p-2 text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#262626] transition-colors opacity-0 group-hover:opacity-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    aria-label="Delete subscription"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add subscription">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-2 block text-12 font-medium text-[#8A8A8A]">Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Netflix" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-12 font-medium text-[#8A8A8A]">Price (₹)</label>
              <input required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field" placeholder="649" />
            </div>
            <div>
              <label className="mb-2 block text-12 font-medium text-[#8A8A8A]">Billing cycle</label>
              <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as any)} className="select-field">
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-12 font-medium text-[#8A8A8A]">Next payment</label>
              <input required type="date" value={nextPayment} onChange={(e) => setNextPayment(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-2 block text-12 font-medium text-[#8A8A8A]">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="select-field">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {(submitError || create.isError) && (
            <div className="rounded-[2px] border border-[#262626] bg-[#161616] p-2.5 text-12 text-[#F5F5F5] font-mono">
              {submitError || apiErrorMessage(create.error)}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? 'Adding subscription...' : 'Add subscription'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}


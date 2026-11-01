import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { CATEGORIES } from '@/lib/constants';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { apiErrorMessage } from '@/lib/api/client';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({ open, onClose }: AddTransactionModalProps) {
  const create = useCreateTransaction();
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const reset = () => {
    setType('EXPENSE');
    setAmount('');
    setCategory(CATEGORIES[0]);
    setDescription('');
    setMerchant('');
    setDate(new Date().toISOString().slice(0, 10));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({ type, amount: Number(amount), category, description, merchant, date });
      reset();
      onClose();
    } catch {
      // shown inline via create.error
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add transaction">
      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('EXPENSE')}
            className={`flex-1 rounded-card border px-3 py-2 text-sm ${type === 'EXPENSE' ? 'border-accent-rose bg-accent-rose/10 text-accent-rose' : 'border-border-subtle text-ink-secondary'}`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('INCOME')}
            className={`flex-1 rounded-card border px-3 py-2 text-sm ${type === 'INCOME' ? 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald' : 'border-border-subtle text-ink-secondary'}`}
          >
            Income
          </button>
        </div>

        <div>
          <label className="mb-1 block text-xs text-ink-secondary">Amount (₹)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-card border border-border-subtle bg-surface px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent-blue"
            placeholder="420"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-ink-secondary">Description</label>
          <input
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-card border border-border-subtle bg-surface px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent-blue"
            placeholder="Dinner order"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-ink-secondary">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-card border border-border-subtle bg-surface px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent-blue"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-secondary">Date</label>
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-card border border-border-subtle bg-surface px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent-blue"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-ink-secondary">Merchant (optional)</label>
          <input
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="w-full rounded-card border border-border-subtle bg-surface px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent-blue"
            placeholder="Swiggy"
          />
        </div>

        {create.isError && <p className="text-xs text-accent-rose">{apiErrorMessage(create.error)}</p>}

        <Button type="submit" className="w-full" disabled={create.isPending}>
          {create.isPending ? 'Adding...' : 'Add transaction'}
        </Button>
      </form>
    </Modal>
  );
}

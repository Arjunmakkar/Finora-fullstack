import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import { formatINR, formatDate } from '@/lib/format';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import type { Transaction } from '@/types';

interface TransactionDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionDrawer({ transaction, onClose }: TransactionDrawerProps) {
  const del = useDeleteTransaction();

  if (!transaction) return <Drawer open={false} onClose={onClose} />;

  const onDelete = async () => {
    await del.mutateAsync(transaction.id);
    onClose();
  };

  return (
    <Drawer open={!!transaction} onClose={onClose} title="Transaction details">
      <div className="space-y-5">
        <div>
          <p className="text-xs text-ink-secondary">Amount</p>
          <p className={`num font-display text-2xl font-semibold ${transaction.type === 'INCOME' ? 'text-accent-emerald' : 'text-accent-rose'}`}>
            {transaction.type === 'INCOME' ? '+' : '−'}
            {formatINR(transaction.amount)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-ink-secondary">Category</p>
            <p className="text-ink-primary">{transaction.category}</p>
          </div>
          <div>
            <p className="text-xs text-ink-secondary">Date</p>
            <p className="text-ink-primary">{formatDate(transaction.date)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-secondary">Merchant</p>
            <p className="text-ink-primary">{transaction.merchant || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-ink-secondary">Payment method</p>
            <p className="text-ink-primary">{transaction.paymentMethod}</p>
          </div>
          <div>
            <p className="text-xs text-ink-secondary">Recurring</p>
            <p className="text-ink-primary">{transaction.recurring ? 'Yes' : 'No'}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-ink-secondary">Description</p>
          <p className="text-sm text-ink-primary">{transaction.description}</p>
        </div>
        {transaction.notes && (
          <div>
            <p className="text-xs text-ink-secondary">Notes</p>
            <p className="text-sm text-ink-primary">{transaction.notes}</p>
          </div>
        )}

        <Button variant="danger" className="w-full" onClick={onDelete} disabled={del.isPending}>
          {del.isPending ? 'Deleting...' : 'Delete transaction'}
        </Button>
      </div>
    </Drawer>
  );
}

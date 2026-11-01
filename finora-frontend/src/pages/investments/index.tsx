import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { formatINR, formatPercent } from '@/lib/format';
import { useInvestments, useInvestmentSummary, useCreateInvestment, useDeleteInvestment } from '@/hooks/useInvestments';
import { apiErrorMessage } from '@/lib/api/client';

const ASSET_TYPES = ['STOCK', 'MUTUAL_FUND', 'ETF', 'GOLD', 'FD', 'OTHER'] as const;
const ALLOC_COLORS: Record<string, string> = {
  STOCK: '#D4FF3A',
  MUTUAL_FUND: '#F5F5F5',
  ETF: '#D4D4D4',
  GOLD: '#A3A3A3',
  FD: '#737373',
  OTHER: '#404040',
};

export default function Investments() {
  const [modalOpen, setModalOpen] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [assetType, setAssetType] = useState<(typeof ASSET_TYPES)[number]>('STOCK');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: investments, isLoading } = useInvestments();
  const { data: summary } = useInvestmentSummary();
  const create = useCreateInvestment();
  const del = useDeleteInvestment();

  const handleOpenModal = () => {
    setSubmitError(null);
    setModalOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await create.mutateAsync({
        assetName,
        symbol: symbol.trim() || undefined,
        assetType,
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        currentPrice: Number(currentPrice),
        purchaseDate,
      } as any);
      setAssetName('');
      setSymbol('');
      setQuantity('');
      setPurchasePrice('');
      setCurrentPrice('');
      setPurchaseDate('');
      setModalOpen(false);
    } catch (err) {
      setSubmitError(apiErrorMessage(err));
    }
  };

  const allocation = summary?.allocation ? Object.entries(summary.allocation as Record<string, number>) : [];
  const allocationTotal = allocation.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investments"
        description="Portfolio value, returns, and asset allocation."
        actions={
          <Button size="sm" onClick={handleOpenModal} id="add-holding-btn">
            <Plus size={14} /> Add holding
          </Button>
        }
      />

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Portfolio Value', value: formatINR(summary.totalPortfolioValue), isAccent: true },
            { label: 'Amount Invested', value: formatINR(summary.totalInvestment), isAccent: false },
            {
              label: 'Profit / Loss',
              value: `${summary.profitLoss < 0 ? '−' : ''}${formatINR(Math.abs(summary.profitLoss))}`,
              isAccent: false,
              isHighlight: summary.profitLoss !== 0,
            },
            {
              label: 'Total Return',
              value: `${summary.returnPercent < 0 ? '−' : ''}${formatPercent(Math.abs(summary.returnPercent))}`,
              isAccent: false,
              isHighlight: summary.returnPercent > 0,
            },
          ].map((s) => (
            <Card key={s.label} className="p-4 border border-[#262626] bg-[#111111]">
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: s.isAccent ? '#D4FF3A' : '#8A8A8A' }}
                />
                <p className="text-12 uppercase tracking-wider font-mono text-[#8A8A8A]">{s.label}</p>
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

      {/* Allocation bar */}
      {allocation.length > 0 && (
        <Card className="p-5 border border-[#262626] bg-[#111111]">
          <p className="mb-4 text-12 uppercase tracking-wider font-mono text-[#8A8A8A]">Asset Allocation</p>
          <div className="flex h-1.5 w-full bg-[#1C1C1C] overflow-hidden rounded-[1px]">
            {allocation.map(([type, value]) => (
              <div
                key={type}
                style={{
                  width: `${(value / allocationTotal) * 100}%`,
                  backgroundColor: ALLOC_COLORS[type] || '#555555',
                }}
                className="transition-all duration-500"
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {allocation.map(([type, value]) => (
              <div
                key={type}
                className="flex items-center gap-2 text-12 font-mono uppercase tracking-wide text-[#8A8A8A]"
              >
                <span
                  className="h-2 w-2 rounded-[1px]"
                  style={{ backgroundColor: ALLOC_COLORS[type] || '#555555' }}
                />
                <span className="text-[#F5F5F5]">{type.replace('_', ' ')}</span>
                <span className="tabular-nums">· {((value / allocationTotal) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Holdings table */}
      <Card className="overflow-hidden border border-[#262626] bg-[#111111]">
        {isLoading && (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full bg-[#1C1C1C]" />)}
          </div>
        )}
        {!isLoading && investments?.length === 0 && (
          <p className="py-16 text-center text-14 text-[#8A8A8A]">No holdings yet — add one to see your portfolio.</p>
        )}
        <div className="divide-y divide-[#262626]">
          {investments?.map((inv) => (
            <div key={inv.id} className="group flex items-center justify-between px-5 py-4 hover:bg-[#151515] transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-[2px] flex items-center justify-center text-12 font-mono font-bold shrink-0 bg-[#0A0A0A] border border-[#262626] tracking-wider"
                  style={{ color: ALLOC_COLORS[inv.assetType] || '#D4FF3A' }}
                >
                  {(inv.symbol || inv.assetName).slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-14 font-medium text-[#F5F5F5]">
                    {inv.assetName}{inv.symbol && <span className="ml-1.5 text-12 text-[#8A8A8A] font-mono">· {inv.symbol}</span>}
                  </p>
                  <p className="text-12 font-mono uppercase tracking-wide text-[#8A8A8A] mt-1">{inv.assetType.replace('_', ' ')} · {inv.quantity} UNITS</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="num text-14 font-semibold text-[#F5F5F5] tabular-nums">{formatINR(inv.currentValue)}</p>
                  <p className={`num text-12 font-mono tabular-nums mt-1 flex items-center justify-end gap-1 ${inv.profitLoss >= 0 ? 'text-[#D4FF3A]' : 'text-[#8A8A8A]'}`}>
                    <TrendingUp size={12} />
                    {inv.returnPercent < 0 ? '−' : ''}{formatPercent(Math.abs(inv.returnPercent))}
                  </p>
                </div>
                <button
                  onClick={() => del.mutate(inv.id)}
                  className="rounded-[2px] p-2 text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#262626] transition-colors opacity-0 group-hover:opacity-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
                  aria-label="Delete holding"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add holding">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-12 font-medium text-[#8A8A8A]">Asset name</label>
              <input required value={assetName} onChange={(e) => setAssetName(e.target.value)} className="input-field" placeholder="Reliance Industries" />
            </div>
            <div>
              <label className="mb-2 block text-12 font-medium text-[#8A8A8A]">Symbol (optional)</label>
              <input value={symbol} onChange={(e) => setSymbol(e.target.value)} className="input-field" placeholder="RELIANCE" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-12 font-medium text-[#8A8A8A]">Asset type</label>
            <select value={assetType} onChange={(e) => setAssetType(e.target.value as any)} className="select-field">
              {ASSET_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-2 block text-12 font-medium text-[#8A8A8A]">Quantity</label>
              <input required type="number" min="0" step="0.0001" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input-field" placeholder="20" />
            </div>
            <div>
              <label className="mb-2 block text-12 font-medium text-[#8A8A8A]">Buy price (₹)</label>
              <input required type="number" min="0" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className="input-field" placeholder="2400" />
            </div>
            <div>
              <label className="mb-2 block text-12 font-medium text-[#8A8A8A]">Current price (₹)</label>
              <input required type="number" min="0" step="0.01" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} className="input-field" placeholder="2850" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-12 font-medium text-[#8A8A8A]">Purchase date</label>
            <input required type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="input-field" />
          </div>
          {(submitError || create.isError) && (
            <div className="rounded-[2px] border border-[#262626] bg-[#161616] p-2.5 text-12 text-[#F5F5F5] font-mono">
              {submitError || apiErrorMessage(create.error)}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? 'Adding holding...' : 'Add holding'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

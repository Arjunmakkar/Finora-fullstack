import { useMemo, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatINR, formatDate } from '@/lib/format';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useTransactions } from '@/hooks/useTransactions';

interface CalEvent {
  id: string;
  label: string;
  category: string;
  date: Date;
  amount: number;
  kind: 'Subscription' | 'Recurring bill' | 'Income' | 'Expense';
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const kindColor = (kind: CalEvent['kind']) => {
  if (kind === 'Income') return '#00d4b4';
  if (kind === 'Subscription') return '#7c5cbf';
  if (kind === 'Recurring bill') return '#f0a93a';
  return '#f0526b'; // Expense
};

export default function Calendar() {
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const { data: subData, isLoading: subsLoading } = useSubscriptions();
  const { data: allTx, isLoading: txLoading } = useTransactions({ range: '1Y' });
  const isLoading = subsLoading || txLoading;

  const events: CalEvent[] = useMemo(() => {
    const subs = subData?.subscriptions.map((s) => ({
      id: `sub-${s.id}`, label: s.name, category: s.category,
      date: new Date(s.nextPayment), amount: s.price, kind: 'Subscription' as const,
    })) ?? [];
    
    const txEvents = allTx?.map((t) => {
      let kind: CalEvent['kind'];
      if (t.type === 'INCOME') kind = 'Income';
      else kind = t.recurring ? 'Recurring bill' : 'Expense';
      
      return {
        id: `tx-${t.id}`, label: t.description, category: t.category,
        date: new Date(t.date), amount: t.amount,
        kind,
      };
    }) ?? [];
    
    return [...subs, ...txEvents];
  }, [subData, allTx]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const eventsOnDay = (day: Date) =>
    events.filter((e) =>
      e.date.getFullYear() === day.getFullYear() &&
      e.date.getMonth() === day.getMonth() &&
      e.date.getDate() === day.getDate()
    );

  const isToday = (day: Date) => {
    const now = new Date();
    return day.getFullYear() === now.getFullYear() &&
      day.getMonth() === now.getMonth() &&
      day.getDate() === now.getDate();
  };

  return (
    <div>
      <PageHeader title="Financial Calendar" description="Salary, rent, EMIs, SIPs, and subscriptions — all in one view." />

      <Card className="p-4 md:p-6 border border-border-subtle bg-surface">
        {/* Month nav */}
        <div className="mb-5 flex items-center justify-between">
          <p className="font-display text-lg font-bold text-ink-primary uppercase tracking-wide">
            {cursor.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="rounded p-2 text-ink-secondary bg-elevated border border-border-strong hover:text-ink-primary hover:border-border-subtle transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="rounded p-2 text-ink-secondary bg-elevated border border-border-strong hover:text-ink-primary hover:border-border-subtle transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <>
            {/* Weekday headers */}
            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-bold tracking-widest uppercase text-ink-tertiary">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const dayEvents = eventsOnDay(day);
                const today = isToday(day);
                return (
                  <button
                    key={i}
                    onClick={() => dayEvents.length > 0 && setSelectedDay(day)}
                    className="flex min-h-[72px] flex-col items-start rounded p-2 text-left transition-all duration-150"
                    style={{
                      background: today ? '#1a1c29' : dayEvents.length > 0 ? '#12131e' : 'transparent',
                      border: today ? '1px solid #00d4b4' : '1px solid #1e2030',
                      cursor: dayEvents.length > 0 ? 'pointer' : 'default',
                    }}
                    onMouseEnter={(e) => {
                      if (dayEvents.length > 0) {
                        (e.currentTarget as HTMLButtonElement).style.background = '#1a1c29';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2d40';
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = today
                        ? '#1a1c29'
                        : dayEvents.length > 0 ? '#12131e' : 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = today
                        ? '#00d4b4'
                        : '#1e2030';
                    }}
                  >
                    <span
                      className={`text-xs font-semibold ${today ? 'text-accent-teal' : 'text-ink-secondary'}`}
                    >
                      {day.getDate()}
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: kindColor(e.kind) }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap gap-4 text-[10px] uppercase font-bold tracking-wider text-ink-tertiary">
              {(['Income', 'Subscription', 'Recurring bill', 'Expense'] as const).map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: kindColor(k) }} />
                  {k}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Modal open={!!selectedDay} onClose={() => setSelectedDay(null)} title={selectedDay ? formatDate(selectedDay.toISOString()) : undefined}>
        <div className="space-y-2">
          {selectedDay && eventsOnDay(selectedDay).map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded px-3 py-2.5 bg-elevated border border-border-strong"
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: kindColor(e.kind) }} />
                <div>
                  <p className="text-sm font-medium text-ink-primary">{e.label}</p>
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-ink-tertiary mt-1">{e.kind} · {e.category}</p>
                </div>
              </div>
              <p className={`num text-sm font-semibold ${e.kind === 'Income' ? 'text-accent-teal' : 'text-ink-primary'}`}>
                {formatINR(e.amount)}
              </p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

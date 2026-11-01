import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Send } from 'lucide-react';
import { useAskFinora } from '@/hooks/useAnalytics';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = [
  'How much did I spend on food this month?',
  'Which category increased the most?',
  'How much did I save last month?',
  'Can I afford a ₹60,000 laptop?',
  'Which subscriptions cost me the most?',
  'How can I save ₹10,000 more each month?',
];

interface Message {
  role: 'user' | 'assistant';
  text: string;
  source?: string;
  scope?: string;
  timeRange?: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Ask specific questions about your spending, savings, budgets, or purchase decisions. I compute answers directly from your active ledger.',
      source: 'Rule Engine',
      scope: 'Active ledger & verified financial records',
      timeRange: 'Current period (Oct 2026)',
    },
  ]);
  const [input, setInput] = useState('');
  const ask = useAskFinora();

  const send = async (question: string) => {
    if (!question.trim()) return;
    const q = question.trim();
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    try {
      const res = (await ask.mutateAsync(q)) as any;
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: res.answer,
          source: res.source || 'Rule Engine',
          scope: res.scope || 'Current ledger entries',
          timeRange: res.timeRange || 'Last 30 days',
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: 'Unable to reach the assistant service. Please verify your connection and try again.',
          source: 'System Diagnostic',
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto space-y-4">
      <PageHeader
        title="Ask Finora"
        description="Query your spending, savings, and budgets using deterministic ledger rules."
      />

      <Card className="flex flex-1 flex-col overflow-hidden border border-[#262626] bg-[#111111]">
        {/* Messages Container */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6 font-sans">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-[4px] px-4 py-3 text-14 leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#161616] border border-[#333333] text-[#F5F5F5]'
                      : 'bg-[#0A0A0A] border border-[#262626] text-[#F5F5F5]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Visible Source & Scope Metadata for Assistant Responses */}
                  {m.role === 'assistant' && (m.source || m.scope) && (
                    <div className="mt-2.5 pt-2 border-t border-[#262626] flex flex-wrap items-center gap-2 text-12 text-[#8A8A8A]">
                      {m.source && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] bg-[#161616] border border-[#262626] text-[#D4FF3A] font-medium text-[11px]">
                          [{m.source}]
                        </span>
                      )}
                      {m.scope && <span>Scope: {m.scope}</span>}
                      {m.timeRange && <span>• {m.timeRange}</span>}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {ask.isPending && (
            <div className="flex items-center gap-2 text-12 text-[#8A8A8A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4FF3A] animate-ping" />
              <span>Analyzing ledger data...</span>
            </div>
          )}
        </div>

        {/* Suggested Data-Specific Questions */}
        <div className="border-t border-[#262626] bg-[#0A0A0A] px-4 py-3">
          <p className="mb-2 text-12 text-[#8A8A8A] font-medium">Suggested queries:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-[4px] border border-[#262626] bg-[#111111] px-2.5 py-1 text-12 text-[#8A8A8A] transition-colors hover:border-[#8A8A8A] hover:text-[#F5F5F5]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-[#262626] bg-[#111111] p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about spending, budgets, savings, or purchase affordability..."
            className="flex-1 bg-[#0A0A0A] border border-[#262626] rounded-[4px] px-3 py-2 text-14 text-[#F5F5F5] placeholder:text-[#8A8A8A] outline-none focus:border-[#D4FF3A] transition-colors"
          />
          <Button type="submit" size="md" disabled={!input.trim() || ask.isPending}>
            <Send size={14} /> Send query
          </Button>
        </form>
      </Card>
    </div>
  );
}

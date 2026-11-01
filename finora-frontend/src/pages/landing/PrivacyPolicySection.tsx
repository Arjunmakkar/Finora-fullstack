import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Database, FileCheck2, EyeOff, UserCheck } from 'lucide-react';
import Card from '@/components/ui/Card';

const policies = [
  {
    icon: Lock,
    title: 'Zero Data Brokering',
    desc: 'Finora never sells, rents, or shares your personal or financial data with third-party advertisers, credit bureaus, or brokers.',
  },
  {
    icon: Database,
    title: 'Local-First Storage',
    desc: 'Your sensitive account records and financial ledgers stay strictly within your private database and browser session.',
  },
  {
    icon: EyeOff,
    title: 'No Tracker Pixels',
    desc: 'We operate with zero commercial marketing trackers, behavioral pixels, or third-party cookies across all modules.',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-Grade Security',
    desc: 'All communications are protected via TLS 1.3 encryption with cryptographic token authentication on all endpoints.',
  },
  {
    icon: FileCheck2,
    title: 'Instant Data Export',
    desc: 'Download your entire transaction history and portfolio breakdown at any moment in open CSV or JSON formats.',
  },
  {
    icon: UserCheck,
    title: 'Absolute Right to Erasure',
    desc: 'You can delete your account and all associated transaction records permanently at any time with one click in Settings.',
  },
];

export default function PrivacyPolicySection() {
  return (
    <section id="privacy" className="relative z-10 w-full max-w-5xl px-6 py-20">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded px-3 py-1 text-[10px] uppercase tracking-widest font-bold border border-border-strong bg-elevated text-accent-teal">
          <ShieldCheck size={14} />
          Data Privacy & Security
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-primary">
          Your finances are nobody else's business.
        </h2>
        <p className="mt-3 max-w-xl text-[11px] font-semibold uppercase tracking-wider text-ink-secondary leading-relaxed">
          Finora was engineered from day one on a foundation of uncompromising privacy. No ads, no data monetization, no compromises.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies.map((p) => {
          const Icon = p.icon;
          return (
            <Card
              key={p.title}
              className="p-5 text-left border border-border-subtle bg-surface transition-colors hover:border-accent-teal"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-card bg-elevated border border-border-strong text-accent-teal">
                <Icon size={18} />
              </div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-primary mb-1.5">
                {p.title}
              </h3>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary leading-relaxed">
                {p.desc}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 rounded-card border border-border-strong bg-elevated p-4 text-center">
        <p className="text-xs text-ink-secondary">
          Questions about our security protocols or compliance? Read our{' '}
          <a href="/privacy" className="text-accent-teal hover:underline font-bold">
            full Privacy Policy documentation
          </a>{' '}
          or reach out to{' '}
          <a href="mailto:privacy@finora.app" className="text-accent-teal hover:underline font-bold">
            privacy@finora.app
          </a>.
        </p>
      </div>
    </section>
  );
}

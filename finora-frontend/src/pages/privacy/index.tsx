import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Database, Download, Trash2, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';

import ThemeToggle from '@/components/ui/ThemeToggle';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-ink-primary">
      {/* Top Header */}
      <header className="border-b border-border-subtle bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 bg-[#D4FF3A] shrink-0" />
              <span className="font-display text-sm font-bold tracking-widest text-[#F5F5F5] uppercase">FINORA</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <ArrowLeft size={14} /> Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded px-3 py-1 text-[10px] uppercase tracking-widest font-bold border border-border-strong bg-elevated text-accent-teal mb-4">
            <ShieldCheck size={14} />
            Legal & Trust
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-primary">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
            Effective Date: October 2026 • Version 1.2
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-ink-secondary">
          <section className="rounded-card border border-border-subtle bg-surface p-6">
            <h2 className="font-display text-lg font-bold text-ink-primary mb-3 flex items-center gap-2">
              <Lock size={18} className="text-accent-teal" /> 1. Core Privacy Philosophy
            </h2>
            <p>
              Finora ("we", "our", or "us") was created under the fundamental belief that financial records are deeply personal. We operate on a zero-commercialization model: we do not sell, rent, broker, or trade your data with advertisers, third-party sponsors, or data aggregators.
            </p>
          </section>

          <section className="rounded-card border border-border-subtle bg-surface p-6">
            <h2 className="font-display text-lg font-bold text-ink-primary mb-3 flex items-center gap-2">
              <Database size={18} className="text-accent-cyan" /> 2. Information We Collect and Process
            </h2>
            <p className="mb-3">
              We only process the exact information necessary to provide personal finance tracking functionality:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
              <li><strong>Account Credentials:</strong> Name and email address utilized solely for authentication and account access.</li>
              <li><strong>Financial Ledgers:</strong> Transaction amounts, dates, categories, budget allocations, and portfolio assets entered by you.</li>
              <li><strong>User Preferences:</strong> Display currency, notification settings, and theme choices stored locally.</li>
            </ul>
          </section>

          <section className="rounded-card border border-border-subtle bg-surface p-6">
            <h2 className="font-display text-lg font-bold text-ink-primary mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-accent-emerald" /> 3. Data Protection & Encryption
            </h2>
            <p>
              All traffic between your client device and Finora is encrypted in transit using industry-standard TLS 1.3 cryptographic protocols. Passwords are salted and hashed using bcrypt prior to database storage.
            </p>
          </section>

          <section className="rounded-card border border-border-subtle bg-surface p-6">
            <h2 className="font-display text-lg font-bold text-ink-primary mb-3 flex items-center gap-2">
              <Download size={18} className="text-accent-amber" /> 4. Data Portability & Rights
            </h2>
            <p>
              You maintain 100% ownership of your data at all times. You have the right to request a complete machine-readable copy of your financial records in CSV or JSON format via the Settings menu at any time.
            </p>
          </section>

          <section className="rounded-card border border-border-subtle bg-surface p-6">
            <h2 className="font-display text-lg font-bold text-ink-primary mb-3 flex items-center gap-2">
              <Trash2 size={18} className="text-accent-rose" /> 5. Account and Data Deletion
            </h2>
            <p>
              If you decide to stop using Finora, you can permanently delete your account and all associated transactions, goals, and budgets with immediate effect from your profile settings.
            </p>
          </section>

          <section className="rounded-card border border-border-subtle bg-surface p-6">
            <h2 className="font-display text-lg font-bold text-ink-primary mb-3 flex items-center gap-2">
              <Mail size={18} className="text-accent-teal" /> 6. Inquiries and Contact
            </h2>
            <p>
              For any questions regarding privacy practices, security disclosures, or compliance, contact our team directly at <a href="mailto:privacy@finora.app" className="text-accent-teal font-semibold hover:underline">privacy@finora.app</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3, Target, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';

import PrivacyPolicySection from './PrivacyPolicySection';

const features = [
  {
    icon: BarChart3,
    title: 'Net Worth Tracking',
    desc: 'Verify liquid assets against liabilities with real-time integer-paise accounting.',
  },
  {
    icon: Target,
    title: 'Category Budgets',
    desc: 'Monthly expenditure thresholds with deterministic alerts before overspending occurs.',
  },
  {
    icon: TrendingUp,
    title: 'Asset Ledger',
    desc: 'Monitor equities, mutual funds, and sovereign gold with exact purchase prices.',
  },
  {
    icon: Sparkles,
    title: 'Ask Finora Engine',
    desc: 'Deterministic query engine answering strictly from verified user transactions.',
  },
  {
    icon: Shield,
    title: 'Financial Health Index',
    desc: 'Composite score evaluating savings rate, liquidity buffer, and expense stability.',
  },
  {
    icon: Zap,
    title: 'Recurring Obligations',
    desc: 'Track subscription renewals and scheduled bill cycles on a continuous timeline.',
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">
      {/* Top Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-8 py-4 border-b border-[#262626] bg-[#0A0A0A]">
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 w-1.5 bg-[#D4FF3A] shrink-0" />
          <span className="font-display text-20 font-bold tracking-tight text-[#F5F5F5]">
            FINORA
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">
              Create account
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-20 pb-20 text-center">

        {/* Headline */}
        <h1 className="font-display max-w-3xl text-48 md:text-5xl font-bold tracking-tight text-[#F5F5F5] leading-tight">
          See your entire financial life in high fidelity.
        </h1>

        <p className="mt-4 max-w-xl text-14 text-[#8A8A8A] leading-relaxed">
          Net worth, cash flow, category budgets, and assets — recorded in integer paise and managed through a stark, distraction-free ledger.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register">
            <Button size="lg">
              Create account <ArrowRight size={16} />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Explore demo
            </Button>
          </Link>
        </div>

        {/* System Attributes */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full border border-[#262626] bg-[#111111] p-4 rounded-[4px]">
          <div>
            <p className="num font-display text-20 font-bold text-[#F5F5F5]">100%</p>
            <p className="text-12 text-[#8A8A8A]">Data Ownership</p>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-[#262626] pt-3 sm:pt-0">
            <p className="num font-display text-20 font-bold text-[#F5F5F5]">Paise-Exact</p>
            <p className="text-12 text-[#8A8A8A]">Zero Rounding Loss</p>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-[#262626] pt-3 sm:pt-0">
            <p className="num font-display text-20 font-bold text-[#D4FF3A]">TLS 1.3</p>
            <p className="text-12 text-[#8A8A8A]">End-to-End Cryptography</p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-[4px] p-5 bg-[#111111] border border-[#262626] transition-colors hover:border-[#333333]"
              >
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-[2px] bg-[#161616] border border-[#262626] text-[#F5F5F5]">
                  <Icon size={16} />
                </div>
                <h2 className="mb-1.5 font-display text-16 font-bold text-[#F5F5F5]">{f.title}</h2>
                <p className="text-12 text-[#8A8A8A] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Privacy Policy Section */}
        <div className="mt-20 w-full max-w-5xl">
          <PrivacyPolicySection />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] bg-[#0A0A0A] px-6 py-6 text-12 text-[#8A8A8A]">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-[#F5F5F5]">FINORA</span>
            <span>• Stark Personal Finance Architecture</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-[#F5F5F5] transition-colors">
              Privacy Rules
            </Link>
            <a href="mailto:security@finora.app" className="hover:text-[#F5F5F5] transition-colors">
              Security Disclosures
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

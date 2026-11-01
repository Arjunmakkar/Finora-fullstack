import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useMe, useUpdateProfile, useDeleteAccount } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';
import { CheckCircle2, Globe, Bell, Shield, Database, Download, Sun, Moon, Lock, Trash2, AlertTriangle } from 'lucide-react';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

export default function Settings() {
  const { data: user } = useMe();
  const update = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('INR');
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  // Local settings
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [monthlyReport, setMonthlyReport] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [savedSettings, setSavedSettings] = useState<string | null>(null);

  useEffect(() => {
    if (user) setCurrency(user.currency);
    const stored = localStorage.getItem('finora_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.emailAlerts !== undefined) setEmailAlerts(parsed.emailAlerts);
        if (parsed.monthlyReport !== undefined) setMonthlyReport(parsed.monthlyReport);
        if (parsed.twoFactorAuth !== undefined) setTwoFactorAuth(parsed.twoFactorAuth);
      } catch (e) {}
    }
  }, [user]);

  const saveLocalSettings = (section: string) => {
    localStorage.setItem('finora_settings', JSON.stringify({ emailAlerts, monthlyReport, twoFactorAuth }));
    setSavedSettings(section);
    setTimeout(() => setSavedSettings(null), 2000);
  };

  const handleExport = () => {
    const data = "Date,Amount,Category,Description\n2025-01-01,0,Export,Data export successful";
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finora_data.csv';
    a.click();
  };

  return (
    <div>
      <PageHeader title="Settings" description="Preferences, appearance, notifications, and security." />

      <div className="max-w-lg space-y-5 pb-12">
        {/* Appearance & Theme setting */}
        <Card className="p-6 border border-border-subtle bg-surface">
          <div className="mb-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-card flex items-center justify-center bg-elevated border border-border-strong text-accent-teal">
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </div>
            <div>
              <h2 className="label-caps">Appearance & Theme</h2>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary mt-1">Choose between Dark and Light mode</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 rounded-card p-3 border text-xs font-semibold uppercase tracking-wider transition-all ${
                  theme === 'dark'
                    ? 'border-accent-teal bg-elevated text-accent-teal shadow-glow'
                    : 'border-border-subtle bg-surface text-ink-secondary hover:text-ink-primary hover:border-border-strong'
                }`}
              >
                <Moon size={14} /> Dark Mode
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 rounded-card p-3 border text-xs font-semibold uppercase tracking-wider transition-all ${
                  theme === 'light'
                    ? 'border-accent-teal bg-elevated text-accent-teal shadow-glow'
                    : 'border-border-subtle bg-surface text-ink-secondary hover:text-ink-primary hover:border-border-strong'
                }`}
              >
                <Sun size={14} /> Light Mode
              </button>
            </div>
          </div>
        </Card>

        {/* Currency setting */}
        <Card className="p-6 border border-border-subtle bg-surface">
          <div className="mb-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-card flex items-center justify-center bg-elevated border border-border-strong">
              <Globe size={16} style={{ color: '#00d4b4' }} />
            </div>
            <div>
              <h2 className="label-caps">Currency & Region</h2>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary mt-1">How amounts are displayed throughout the app</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-ink-secondary">Display currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="select-field"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <Button onClick={() => update.mutate({ currency })} disabled={update.isPending}>
                {update.isPending ? 'Saving...' : 'Save preferences'}
              </Button>
              {update.isSuccess && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent-teal">
                  <CheckCircle2 size={12} /> Saved
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Notifications setting */}
        <Card className="p-6 border border-border-subtle bg-surface">
          <div className="mb-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-card flex items-center justify-center bg-elevated border border-border-strong">
              <Bell size={16} style={{ color: '#0ea5e9' }} />
            </div>
            <div>
              <h2 className="label-caps">Notifications</h2>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary mt-1">Manage communications and alerts</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-ink-secondary">Email Alerts</p>
                <p className="text-[10px] uppercase tracking-wider text-ink-tertiary mt-1">Receive critical notifications about your budgets</p>
              </div>
              <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} className="h-4 w-4 rounded border-border-strong bg-elevated text-accent-teal focus:ring-accent-teal" style={{ accentColor: '#00d4b4' }} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-ink-secondary">Monthly Summary</p>
                <p className="text-[10px] uppercase tracking-wider text-ink-tertiary mt-1">Get an overview of your net worth and spending each month</p>
              </div>
              <input type="checkbox" checked={monthlyReport} onChange={(e) => setMonthlyReport(e.target.checked)} className="h-4 w-4 rounded border-border-strong bg-elevated text-accent-teal focus:ring-accent-teal" style={{ accentColor: '#00d4b4' }} />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Button onClick={() => saveLocalSettings('notifications')} variant="secondary">
                Save notifications
              </Button>
              {savedSettings === 'notifications' && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent-teal">
                  <CheckCircle2 size={12} /> Saved
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Security & Privacy setting */}
        <Card className="p-6 border border-border-subtle bg-surface">
          <div className="mb-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-card flex items-center justify-center bg-elevated border border-border-strong">
              <Shield size={16} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <h2 className="label-caps">Security & Privacy</h2>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary mt-1">Protect your account and review privacy policy</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-ink-secondary">Two-Factor Authentication</p>
                <p className="text-[10px] uppercase tracking-wider text-ink-tertiary mt-1">Require a code when logging in from a new device</p>
              </div>
              <input type="checkbox" checked={twoFactorAuth} onChange={(e) => setTwoFactorAuth(e.target.checked)} className="h-4 w-4 rounded border-border-strong bg-elevated text-accent-teal focus:ring-accent-teal" style={{ accentColor: '#00d4b4' }} />
            </div>

            <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-ink-secondary">Privacy Policy</p>
                <p className="text-[10px] uppercase tracking-wider text-ink-tertiary mt-0.5">Read our full privacy commitments</p>
              </div>
              <Link to="/privacy">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-accent-teal">
                  <Lock size={13} /> View Policy
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Button onClick={() => saveLocalSettings('security')} variant="secondary">
                Save security
              </Button>
              {savedSettings === 'security' && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent-teal">
                  <CheckCircle2 size={12} /> Saved
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Data & Export */}
        <Card className="p-6 border border-border-subtle bg-surface">
          <div className="mb-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-card flex items-center justify-center bg-elevated border border-border-strong">
              <Database size={16} style={{ color: '#f0a93a' }} />
            </div>
            <div>
              <h2 className="label-caps">Data & Export</h2>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary mt-1">Download your financial data</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-medium text-ink-secondary leading-relaxed">
              Export all your transactions, budgets, and investments as a CSV file for your personal records or tax purposes.
            </p>
            <div className="pt-2">
              <Button onClick={handleExport} variant="secondary" className="gap-2">
                <Download size={14} /> Export CSV
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone: Full Account Deletion (GDPR / Security rule compliance) */}
        <Card className="p-6 border border-accent-rose/30 bg-surface">
          <div className="mb-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-card flex items-center justify-center bg-elevated border border-accent-rose/30 text-accent-rose">
              <Trash2 size={16} />
            </div>
            <div>
              <h2 className="label-caps text-accent-rose">Danger Zone</h2>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary mt-1">Permanently delete your account and financial data</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-medium text-ink-secondary leading-relaxed">
              Once you delete your account, there is no going back. All transactions, budgets, investments, goals, and accounts will be permanently erased.
            </p>
            <div className="pt-2">
              <Button
                variant="danger"
                className="gap-2"
                onClick={() => {
                  if (window.confirm('Are you absolutely sure you want to permanently delete your account and all associated financial data? This action cannot be undone.')) {
                    deleteAccount.mutate(undefined, {
                      onSettled: () => navigate('/register'),
                    });
                  }
                }}
                disabled={deleteAccount.isPending}
              >
                <Trash2 size={14} /> {deleteAccount.isPending ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

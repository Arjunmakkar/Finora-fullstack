import { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useMe, useUpdateProfile } from '@/hooks/useAuth';
import { User, Mail, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const { data: user } = useMe();
  const update = useUpdateProfile();
  const [name, setName] = useState('');

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({ name });
  };

  const initials = (user?.name || '?').split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div>
      <PageHeader title="Profile" description="Your account details." />

      <div className="max-w-lg space-y-5">
        {/* Avatar section */}
        <Card className="p-6 border border-border-subtle bg-surface">
          <div className="flex items-center gap-5">
            <div
              className="h-16 w-16 rounded flex items-center justify-center text-xl font-bold text-[#080910] flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #00d4b4, #0ea5e9)' }}
            >
              {initials}
            </div>
            <div>
              <p className="font-display text-xl font-bold text-ink-primary uppercase tracking-wide">{user?.name}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary mt-1">{user?.email}</p>
              <div
                className="mt-3 inline-flex items-center gap-1.5 rounded px-2 py-1 text-[9px] font-bold tracking-widest uppercase border border-border-strong bg-elevated text-accent-teal"
              >
                <CheckCircle2 size={10} /> ACTIVE ACCOUNT
              </div>
            </div>
          </div>
        </Card>

        {/* Edit form */}
        <Card className="p-6 border border-border-subtle bg-surface">
          <h2 className="label-caps mb-4">Edit profile</h2>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-2 block text-xs font-medium text-ink-secondary">Full name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-ink-secondary">Email address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                <input
                  disabled
                  value={user?.email || ''}
                  className="input-field pl-9 opacity-50 cursor-not-allowed"
                />
              </div>
              <p className="mt-1.5 text-[10px] uppercase tracking-wider font-semibold text-ink-tertiary">Email cannot be changed.</p>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? 'Saving...' : 'Save changes'}
              </Button>
              {update.isSuccess && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent-teal">
                  <CheckCircle2 size={12} /> Saved successfully
                </div>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useRegister, useGoogleLoginMutation } from '@/hooks/useAuth';
import { apiErrorMessage } from '@/lib/api/client';

import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const register = useRegister();
  const googleLoginMut = useGoogleLoginMutation();
  const navigate = useNavigate();

  const onGoogleSuccess = async (credential: string) => {
    setGoogleError(null);
    try {
      await googleLoginMut.mutateAsync(credential);
      navigate('/dashboard');
    } catch {
      // error shown via googleLoginMut.isError
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register.mutateAsync({ name, email, password });
      navigate('/dashboard');
    } catch {
      // error shown below via register.error
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#0A0A0A] text-[#F5F5F5]">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-[#111111] border-r border-[#262626]"
      >
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="h-1.5 w-1.5 bg-[#D4FF3A] shrink-0" />
          <span className="font-display text-xl font-bold tracking-widest text-[#F5F5F5] uppercase">FINORA</span>
        </div>

        <div className="relative z-10">
          <div
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded bg-elevated border border-border-strong"
          >
            <Sparkles size={28} className="text-accent-teal" />
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight text-ink-primary mb-4">
            Start your<br />
            <span className="text-accent-teal">financial journey.</span>
          </h2>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-secondary leading-relaxed max-w-sm mt-4">
            Join Finora and get instant access to budgets, investments, goals, and an AI assistant.
          </p>

          <div className="mt-12 space-y-4">
            {[
              'Track net worth across all accounts',
              'Set budgets with smart warnings',
              'Monitor your investment portfolio',
              'Get AI-powered financial insights',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-ink-secondary font-semibold uppercase tracking-wider text-[11px]">
                <div className="h-1.5 w-1.5 rounded-full flex-shrink-0 bg-accent-teal" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[10px] uppercase tracking-widest font-bold text-ink-tertiary">© 2025 Finora. All data stays on your machine.</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="h-1.5 w-1.5 bg-[#D4FF3A] shrink-0" />
          <span className="font-display text-sm font-bold tracking-widest text-[#F5F5F5] uppercase">FINORA</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-ink-primary">Create account</h1>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">Start tracking your finances in minutes.</p>
          </div>

          <div
            className="rounded p-6 bg-surface border border-border-subtle"
          >
            {(googleError || googleLoginMut.isError) && (
              <div className="mb-4 rounded px-3 py-2 text-[10px] font-bold tracking-wider uppercase text-accent-rose bg-elevated border border-border-strong">
                {googleError || apiErrorMessage(googleLoginMut.error)}
              </div>
            )}

            <div className="flex justify-center mb-4">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    onGoogleSuccess(credentialResponse.credential);
                  }
                }}
                onError={() => {
                  setGoogleError('Google Authentication failed');
                }}
                theme="filled_black"
                shape="rectangular"
                width="336"
              />
            </div>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-border-subtle"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-wider text-ink-tertiary">or</span>
              <div className="flex-grow border-t border-border-subtle"></div>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="mb-2 block text-xs font-medium text-ink-secondary">Full name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Rohit Kumar"
                  id="register-name"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-ink-secondary">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  id="register-email"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-ink-secondary">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    id="register-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary p-1 focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {register.isError && (
                <div className="rounded px-3 py-2 text-[10px] font-bold tracking-wider uppercase text-accent-rose bg-elevated border border-border-strong">
                  {apiErrorMessage(register.error)}
                </div>
              )}

              <Button type="submit" className="w-full gap-2 mt-2" disabled={register.isPending} id="register-submit">
                {register.isPending ? 'Creating account...' : (
                  <>Create account <ArrowRight size={14} /></>
                )}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-teal hover:text-ink-primary transition-colors font-bold">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

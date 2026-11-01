import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useLogin, useGoogleLoginMutation } from '@/hooks/useAuth';
import { apiErrorMessage } from '@/lib/api/client';

import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('demo@finora.app');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  
  const login = useLogin();
  const googleLoginMut = useGoogleLoginMutation();
  const navigate = useNavigate();

  const onGoogleSuccess = async (credential: string) => {
    setGoogleError(null);
    try {
      await googleLoginMut.mutateAsync(credential);
      navigate('/dashboard');
    } catch {
      // error is shown via googleLoginMut.isError
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      navigate('/dashboard');
    } catch {
      // error shown below via login.error
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#0A0A0A] text-[#F5F5F5]">
      {/* Left panel — solid dark stark */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-[#111111] border-r border-[#262626]"
      >
        {/* Brand */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="h-1.5 w-1.5 bg-[#D4FF3A] shrink-0" />
          <span className="font-display text-xl font-bold tracking-widest text-[#F5F5F5] uppercase">FINORA</span>
        </div>

        {/* Center copy */}
        <div className="relative z-10">
          <div
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded bg-elevated border border-border-strong"
          >
            <TrendingUp size={28} className="text-accent-teal" />
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight text-ink-primary mb-4">
            Your money,<br />
            <span className="text-accent-teal">crystal clear.</span>
          </h2>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-secondary leading-relaxed max-w-sm mt-4">
            Track net worth, budgets, investments, and goals — all in one dashboard.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { value: '8+', label: 'Finance modules' },
              { value: '100%', label: 'Local & private' },
              { value: '₹0', label: 'Monthly fees' },
              { value: 'AI', label: 'Finance assistant' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded p-4 bg-elevated border border-border-strong"
              >
                <div className="font-display text-2xl font-bold text-ink-primary">{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-ink-tertiary mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[10px] uppercase tracking-widest font-bold text-ink-tertiary">© 2025 Finora. All data stays on your machine.</p>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile brand */}
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
            <h1 className="font-display text-3xl font-bold text-ink-primary">Welcome back</h1>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">Sign in to your dashboard.</p>
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
                  setGoogleError('Google Sign-in failed');
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
                <label className="mb-2 block text-xs font-medium text-ink-secondary">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  id="login-email"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-ink-secondary">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    id="login-password"
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

              {login.isError && (
                <div className="rounded px-3 py-2 text-[10px] font-bold tracking-wider uppercase text-accent-rose bg-elevated border border-border-strong">
                  {apiErrorMessage(login.error)}
                </div>
              )}

              <Button type="submit" className="w-full gap-2 mt-2" disabled={login.isPending} id="login-submit">
                {login.isPending ? 'Signing in...' : (
                  <>Sign in <ArrowRight size={14} /></>
                )}
              </Button>
            </form>

            <p className="mt-5 text-center text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary">
              Demo account prefilled — just hit Sign in.
            </p>
          </div>

          <p className="mt-6 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-teal hover:text-ink-primary transition-colors font-bold">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

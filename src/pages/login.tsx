import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks';
import { Button, Input } from '@/components/ui';
import { LoginRequest } from '@/types/api';

export default function Login() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(formData);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-12 h-72 w-72 rounded-full bg-accent-300/35 blur-3xl" />
        <div className="absolute right-[-8%] top-0 h-80 w-80 rounded-full bg-primary-300/35 blur-3xl" />
        <div className="absolute bottom-[-5%] left-1/3 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-hero-grid bg-[size:42px_42px] opacity-[0.05]" />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden lg:block">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-semibold text-ink-700 shadow-soft backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-accent-500" />
              Modern ROSCA operations, designed for clarity
            </div>
            <h1 className="mt-8 max-w-xl text-5xl font-bold leading-tight text-ink-900">
              Manage contributions, payouts, and season momentum in one refined workspace.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-600">
              Tuimizane brings your savings circle into a calmer, more structured dashboard with cleaner payment tracking and better operational visibility.
            </p>

            <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
              {[
                { label: 'Weekly cycles', value: 'Automated' },
                { label: 'Member visibility', value: 'Live status' },
                { label: 'Payout clarity', value: 'Priority-ready' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-panel backdrop-blur"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">{item.label}</p>
                  <p className="mt-3 text-xl font-bold text-ink-900">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-2">
              <div className="rounded-[32px] border border-ink-900/10 bg-ink-900 p-6 text-white shadow-panel">
                <p className="text-sm font-semibold text-white/70">Circle health</p>
                <p className="mt-3 text-4xl font-bold">98%</p>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Clean operational visibility for active members, upcoming payouts, and contribution performance.
                </p>
              </div>
              <div className="animate-float-soft rounded-[32px] border border-white/70 bg-white/72 p-6 shadow-panel backdrop-blur">
                <p className="text-sm font-semibold text-ink-500">Featured workflow</p>
                <p className="mt-3 text-2xl font-bold text-ink-900">Monday payout review</p>
                <p className="mt-3 text-sm leading-6 text-ink-600">
                  Start each cycle with the next member, payment method, and completion pulse already visible.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl">
          <div className="rounded-[36px] border border-white/70 bg-white/78 p-6 shadow-panel backdrop-blur sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-ink-900 via-primary-700 to-accent-500 text-lg font-bold text-white shadow-glow">
                  T
                </div>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-ink-400">
                  Tuimizane portal
                </p>
                <h2 className="mt-3 text-4xl font-bold text-ink-900">Sign in</h2>
                <p className="mt-3 text-sm leading-6 text-ink-600">
                  Access your savings circle dashboard, review season progress, and manage payouts with a cleaner workspace.
                </p>
              </div>
              <div className="hidden rounded-[24px] border border-accent-200 bg-accent-50 px-4 py-3 text-right sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-700">Status</p>
                <p className="mt-1 text-sm font-semibold text-accent-900">Secure access</p>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input
                  id="username"
                  label="Username or Email"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your username or email"
                  required
                  autoFocus
                />

                <Input
                  id="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="rounded-[24px] border border-danger-200 bg-danger-50/90 p-4 shadow-soft">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-danger-100 text-danger-600">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-danger-800">Sign in failed</h3>
                      <p className="mt-1 text-sm text-danger-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 border-y border-slate-200/80 py-4 sm:flex-row sm:items-center sm:justify-between">
                <label htmlFor="remember-me" className="flex items-center gap-3 text-sm text-ink-600">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-5 w-5 rounded-md border-slate-300 text-accent-500 focus:ring-accent-300"
                  />
                  Keep this device signed in
                </label>

                <a href="#" className="text-sm font-semibold text-primary-700 transition hover:text-accent-600">
                  Forgot your password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isLoading}
                disabled={!formData.username || !formData.password}
              >
                Enter dashboard
              </Button>

              <div className="flex items-center justify-between gap-4 rounded-[24px] bg-slate-50 px-4 py-3 text-sm text-ink-600">
                <p>Need an account?</p>
                <a href="#" className="font-semibold text-ink-900 transition hover:text-accent-600">
                  Contact your administrator
                </a>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

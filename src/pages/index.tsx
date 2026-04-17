import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks';

export default function Home() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isLoading) {
      return;
    }

    router.replace(isAuthenticated ? '/dashboard' : '/login');
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[12%] top-[18%] h-56 w-56 rounded-full bg-accent-300/30 blur-3xl" />
        <div className="absolute bottom-[12%] right-[14%] h-72 w-72 rounded-full bg-primary-300/30 blur-3xl" />
        <div className="absolute inset-0 bg-hero-grid bg-[size:42px_42px] opacity-[0.05]" />
      </div>
      <div className="glass-panel w-full max-w-md rounded-[32px] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-[22px] bg-gradient-to-br from-ink-900 via-primary-700 to-accent-500 text-xl font-bold text-white shadow-glow">
          T
        </div>
        <p className="section-kicker mt-6">Preparing workspace</p>
        <h1 className="mt-3 text-3xl font-bold text-ink-900">Loading Tuimizane</h1>
        <p className="mt-3 text-sm leading-6 text-ink-600">
          We&apos;re checking your session and routing you to the right place.
        </p>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-600">Loading Tuimizane...</p>
    </div>
  );
}

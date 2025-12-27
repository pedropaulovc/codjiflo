'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    hasHydrated: state.hasHydrated,
  }));

  useEffect(() => {
    if (!hasHydrated) return;
    // Home page redirects based on auth status
    router.replace(isAuthenticated ? '/dashboard' : '/login');
  }, [hasHydrated, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">Redirecting...</div>
    </div>
  );
}

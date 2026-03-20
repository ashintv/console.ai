'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Simple check: if no token in localStorage, redirect to login
    const token = localStorage.getItem('console-ai-token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return <>{children}</>;
}

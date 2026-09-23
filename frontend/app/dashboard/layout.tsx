'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiUser } from '@/lib/api';
import { AuthContext } from '@/lib/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    (async () => {
      await refresh();
      setChecking(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    try {
      await api.logout();
    } finally {
      router.push('/login');
    }
  }

  if (checking || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-ink/50">Loading…</p>
      </main>
    );
  }

  return (
    <AuthContext.Provider value={{ user, refresh }}>
      <div className="min-h-screen">
        <header className="border-b border-black/10 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <Link href="/dashboard" className="font-semibold text-ink">
              Account Console
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-ink/60">{user.name}</span>
              <button onClick={handleLogout} className="btn-secondary">
                Log out
              </button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-4 py-8">{children}</div>
      </div>
    </AuthContext.Provider>
  );
}
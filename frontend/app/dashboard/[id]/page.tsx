'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, ApiError, ApiUser } from '@/lib/api';

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getUser(params.id);
        setUser(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not load user');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  return (
    <div className="space-y-4">
      <Link href="/dashboard" className="text-sm font-medium text-moss hover:underline">
        ← Back to all users
      </Link>

      <section className="card p-6">
        {loading && <p className="text-sm text-ink/50">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {user && (
          <div className="space-y-2">
            <h1 className="text-lg font-semibold text-ink">{user.name}</h1>
            <p className="text-sm text-ink/60">{user.email}</p>
            <p className="text-xs text-ink/40">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
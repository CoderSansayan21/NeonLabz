'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError, ApiUser } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { user, refresh } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [listError, setListError] = useState('');

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.listUsers();
        setUsers(list);
      } catch (err) {
        setListError(err instanceof ApiError ? err.message : 'Could not load users');
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (name.trim().length < 2) {
      setFormError('Name must be at least 2 characters');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFormError('Enter a valid email address');
      return;
    }

    setSaving(true);
    try {
      await api.updateMe({ name: name.trim(), email: email.trim() });
      await refresh();
      setFormSuccess('Profile updated');
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, name: name.trim(), email: email.trim() } : u)),
      );
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.deleteMe();
      router.push('/login');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not delete account');
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <h1 className="text-lg font-semibold text-ink">Your profile</h1>
        <form onSubmit={handleSave} noValidate className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="field-label">Name</label>
            <input
              id="name"
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email"
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {formError && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>
          )}
          {formSuccess && (
            <div className="rounded-md bg-moss/10 px-3 py-2 text-sm text-moss">{formSuccess}</div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save changes'}
            </button>

            {!confirmingDelete ? (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete account
              </button>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-ink/70">Delete your account permanently?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-danger"
                >
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-ink">All users</h2>
        {loadingUsers && <p className="mt-3 text-sm text-ink/50">Loading users…</p>}
        {listError && <p className="mt-3 text-sm text-red-600">{listError}</p>}
        {!loadingUsers && !listError && (
          <ul className="mt-4 divide-y divide-black/10">
            {users.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {u.name} {u.id === user.id && <span className="text-ink/40">(you)</span>}
                  </p>
                  <p className="text-sm text-ink/50">{u.email}</p>
                </div>
                <Link
                  href={`/dashboard/${u.id}`}
                  className="text-sm font-medium text-moss hover:underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
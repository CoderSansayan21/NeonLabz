'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      await api.login({ email: email.trim(), password });
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Login failed';
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink/60">Log in to your account.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email"
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          {errors.form && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.form}
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-moss hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
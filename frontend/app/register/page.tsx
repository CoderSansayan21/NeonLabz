'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address';
    if (password.length < 8) next.password = 'Password must be at least 8 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      await api.register({ name: name.trim(), email: email.trim(), password });
      await api.login({ email: email.trim(), password });
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Registration failed';
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-xl font-semibold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink/60">Takes less than a minute.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="field-label">Name</label>
            <input
              id="name"
              type="text"
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

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
              autoComplete="new-password"
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          {errors.form && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.form}
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-moss hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/analyze';
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push(redirect);
    } catch (err: any) {
      setError(err.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-bg-card rounded-2xl p-8 border border-border shadow-sm space-y-4">
      {error && (
        <div className="bg-fire/10 text-fire text-sm px-4 py-2.5 rounded-lg">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-3 text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-3 text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-gold-light font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-text-muted">
        No account?{' '}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">☯</span>
          <h1 className="text-2xl font-bold text-text mt-3 tracking-wide">Welcome Back</h1>
          <div className="flex justify-center items-center gap-2 mt-2 text-gold text-sm">
            <span className="w-6 h-px bg-gold" /><span>◆</span><span className="w-6 h-px bg-gold" />
          </div>
        </div>
        <Suspense fallback={<div className="text-center text-text-muted">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

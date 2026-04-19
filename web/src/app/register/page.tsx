'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { authAPI } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleSendCode = async () => {
    if (!email) { setError('Please enter your email'); return; }
    try {
      setError('');
      await authAPI.sendCode(email);
      setCountdown(60);
      timerRef.current = setInterval(() => {
        setCountdown((p) => {
          if (p <= 1) { clearInterval(timerRef.current!); return 0; }
          return p - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.error || 'Failed to send code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await register(email, password, code, name);
      router.push('/analyze');
    } catch (err: any) {
      setError(err.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">☯</span>
          <h1 className="text-2xl font-bold text-text mt-3 tracking-wide">Create Account</h1>
          <div className="flex justify-center items-center gap-2 mt-2 text-gold text-sm">
            <span className="w-6 h-px bg-gold" /><span>◆</span><span className="w-6 h-px bg-gold" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-card rounded-2xl p-8 border border-border shadow-sm space-y-4">
          {error && (
            <div className="bg-fire/10 text-fire text-sm px-4 py-2.5 rounded-lg">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

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
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Verification Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="flex-1 border border-border rounded-lg px-4 py-3 text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                required
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0}
                className="shrink-0 bg-primary text-gold-light text-sm font-medium px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-text-muted disabled:text-bg-secondary"
              >
                {countdown > 0 ? `${countdown}s` : 'Send Code'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              className="w-full border border-border rounded-lg px-4 py-3 text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              required
            />
            <p className="text-xs text-text-muted mt-1">At least 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-gold-light font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

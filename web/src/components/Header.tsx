'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-border bg-bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-2xl">☯</span>
          <span className="font-bold text-lg text-primary tracking-wide group-hover:text-primary-dark transition-colors">
            FengShui Master
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/analyze" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                Analyze
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                My Reports
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-text-muted hover:text-fire transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                Log In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-primary text-gold-light px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

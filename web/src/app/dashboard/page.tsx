'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { reportAPI } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    reportAPI.getAll()
      .then((data) => setReports(data.reports))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-jade border-jade';
    if (score >= 40) return 'text-gold border-gold';
    return 'text-primary border-primary';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin text-3xl">☯</div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">My Reports</h1>
          <div className="flex items-center gap-2 mt-1 text-gold text-sm">
            <span className="w-6 h-px bg-gold" /><span>◆</span><span className="w-6 h-px bg-gold" />
          </div>
        </div>
        <Link
          href="/analyze"
          className="bg-primary text-gold-light font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
        >
          + New Analysis
        </Link>
      </div>

      {error && (
        <div className="bg-fire/10 text-fire text-sm px-4 py-3 rounded-lg mb-6">
          Failed to load reports. Please check your network.
        </div>
      )}

      {reports.length === 0 && !error ? (
        <div className="text-center py-20">
          <span className="text-6xl opacity-30">☯</span>
          <p className="text-text-muted mt-4">No reports yet.</p>
          <Link
            href="/analyze"
            className="inline-block mt-4 text-primary font-medium hover:underline"
          >
            Start your first analysis
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Link
              key={r.id}
              href={`/report/${r.id}`}
              className="flex items-center gap-4 bg-bg-card rounded-xl p-4 border border-border hover:border-gold/50 transition-colors group"
            >
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-bg font-bold text-sm ${getScoreColor(r.overall_score)}`}>
                {r.overall_score}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-secondary">{formatDate(r.created_at)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${r.is_paid ? 'bg-jade/10 text-jade' : 'bg-bg-secondary text-text-muted'}`}>
                    {r.is_paid ? 'Unlocked' : 'Free'}
                  </span>
                  {r.analysis_status === 'analyzing' && (
                    <span className="text-xs text-gold font-medium">Analyzing...</span>
                  )}
                </div>
              </div>
              <span className="text-text-muted group-hover:text-primary transition-colors text-lg">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

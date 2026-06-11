'use client';

import { useState, useEffect, useRef, use } from 'react';
import { palmReadingAPI, stripeAPI } from '@/lib/api';

function ScoreCircle({ score, size = 80 }: { score: number; size?: number }) {
  const color = score >= 70 ? 'text-jade border-jade' : score >= 40 ? 'text-gold border-gold' : 'text-primary border-primary';
  return (
    <div className={`rounded-full border-3 flex items-center justify-center bg-bg ${color}`} style={{ width: size, height: size }}>
      <span className="font-bold" style={{ fontSize: size * 0.35 }}>{score}</span>
    </div>
  );
}

function SeverityBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    high: 'bg-primary text-white',
    medium: 'bg-gold text-white',
    low: 'bg-jade text-white',
  };
  const labels: Record<string, string> = { high: 'Strong', medium: 'Moderate', low: 'Subtle' };
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${styles[level] || 'bg-text-muted text-white'}`}>{labels[level] || level}</span>;
}

const AREA_ICONS: Record<string, string> = {
  'Wealth & Finance': '💰',
  'Love & Relationships': '❤️',
  'Career & Success': '🏆',
  'Health & Vitality': '🌿',
  'Life Path & Destiny': '🔮',
};

function FullAreaCard({ area }: { area: any }) {
  return (
    <div className="bg-bg-card rounded-2xl p-6 border border-border mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text flex items-center gap-2">
          <span>{AREA_ICONS[area.name] || '✦'}</span> {area.name}
        </h3>
        <ScoreCircle score={area.score} size={48} />
      </div>

      {area.issues?.map((issue: any, i: number) => (
        <div key={i} className="bg-[#FDF5F0] rounded-xl p-4 mb-3 border-l-3 border-l-primary">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-sm font-semibold text-text leading-relaxed flex-1">{issue.description}</p>
            <SeverityBadge level={issue.severity} />
          </div>
          <div className="mb-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Impact</span>
            <p className="text-sm text-text-secondary leading-relaxed mt-0.5">{issue.impact}</p>
          </div>
          {issue.solution && (
            <div>
              <span className="text-xs font-bold text-jade uppercase tracking-wider">Guidance</span>
              <p className="text-sm text-jade-dark leading-relaxed mt-0.5">{issue.solution}</p>
            </div>
          )}
        </div>
      ))}

      {area.positives?.length > 0 && (
        <div className="bg-[#F0F7F2] rounded-xl p-4 border-l-3 border-l-jade mb-3">
          <span className="text-xs font-bold text-jade uppercase tracking-wider">Strengths</span>
          {area.positives.map((p: string, i: number) => (
            <p key={i} className="text-sm text-jade-dark leading-relaxed mt-1">✦ {p}</p>
          ))}
        </div>
      )}

      {area.suggestions?.length > 0 && (
        <div className="bg-[#F0F4FF] rounded-xl p-4 border-l-3 border-l-[#6366F1]">
          <span className="text-xs font-bold text-[#6366F1] uppercase tracking-wider">Suggestions</span>
          {area.suggestions.map((s: string, i: number) => (
            <div key={i} className="flex gap-2 mt-1.5">
              <span className="text-[#6366F1] text-sm font-bold">{i + 1}.</span>
              <p className="text-sm text-text-secondary leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FreeAreaCard({ area }: { area: any }) {
  return (
    <div className="bg-bg-card rounded-2xl p-6 border border-border mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text flex items-center gap-2">
          <span>{AREA_ICONS[area.name] || '✦'}</span> {area.name}
        </h3>
        <ScoreCircle score={area.score} size={48} />
      </div>

      {area.issues?.map((issue: any, i: number) => (
        <div key={i} className="bg-[#FDF5F0] rounded-xl p-4 mb-3 border-l-3 border-l-primary">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-sm font-semibold text-text leading-relaxed flex-1">{issue.description}</p>
            <SeverityBadge level={issue.severity} />
          </div>
          <div className="mb-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Impact</span>
            <p className="text-sm text-text-secondary leading-relaxed mt-0.5">{issue.impact}</p>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-sm">🔒</span>
            <span className="text-xs text-primary font-semibold italic">Guidance available — unlock to view</span>
          </div>
        </div>
      ))}

      {area.positives?.length > 0 && (
        <div className="bg-[#F0F7F2] rounded-xl p-4 border-l-3 border-l-jade mb-3">
          <span className="text-xs font-bold text-jade uppercase tracking-wider">Strengths</span>
          {area.positives.map((p: string, i: number) => (
            <p key={i} className="text-sm text-jade-dark leading-relaxed mt-1">✦ {p}</p>
          ))}
        </div>
      )}

      {area.suggestion_count > 0 && (
        <div className="flex items-center justify-between bg-[#F0F4FF] rounded-lg px-4 py-2.5">
          <span className="text-sm text-[#6366F1] font-medium">{area.suggestion_count} {area.suggestion_count === 1 ? 'suggestion' : 'suggestions'} ready</span>
          <span className="text-sm">🔒</span>
        </div>
      )}
    </div>
  );
}

function LockedAreaCard({ area }: { area: any }) {
  return (
    <div className="bg-bg-card rounded-2xl p-6 border border-dashed border-text-muted mb-4 opacity-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-text flex items-center gap-2">
          <span className="text-sm">🔒</span> <span>{AREA_ICONS[area.name] || '✦'}</span> {area.name}
        </h3>
        <ScoreCircle score={area.score} size={48} />
      </div>
      {area.preview && (
        <p className="text-sm text-text-muted italic leading-relaxed mb-3">{area.preview}</p>
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-[#FDF5F0] rounded-lg px-4 py-2.5">
          <span className="text-sm text-primary font-medium">{area.issue_count} {area.issue_count === 1 ? 'insight' : 'insights'} found</span>
          <SeverityBadge level="high" />
        </div>
        <div className="flex items-center justify-between bg-[#F0F7F2] rounded-lg px-4 py-2.5">
          <span className="text-sm text-jade font-medium">{area.solution_count || area.issue_count} guidance ready</span>
          <span className="text-sm">🔒</span>
        </div>
        {area.suggestion_count > 0 && (
          <div className="flex items-center justify-between bg-[#F0F4FF] rounded-lg px-4 py-2.5">
            <span className="text-sm text-[#6366F1] font-medium">{area.suggestion_count} {area.suggestion_count === 1 ? 'suggestion' : 'suggestions'} ready</span>
            <span className="text-sm">🔒</span>
          </div>
        )}
        <p className="text-xs text-primary font-semibold italic text-center pt-1">Unlock to reveal detailed insights & personalized guidance</p>
      </div>
    </div>
  );
}

function QuickAreaCard({ area }: { area: any }) {
  return (
    <div className="bg-bg-card rounded-2xl p-6 border border-border mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-text flex items-center gap-2">
          <span>{AREA_ICONS[area.name] || '✦'}</span> {area.name}
        </h3>
        <ScoreCircle score={area.score} size={48} />
      </div>
      {area.brief && <p className="text-sm text-text-secondary leading-relaxed">{area.brief}</p>}
    </div>
  );
}

export default function PalmReadingReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState('');
  const pollingRef = useRef<ReturnType<typeof setInterval>>(null);
  const retryCount = useRef(0);

  useEffect(() => {
    const url = new URL(window.location.href);
    const payment = url.searchParams.get('payment');
    if (payment === 'success') {
      setPaymentMsg('Payment successful! Loading your full reading...');
      window.history.replaceState({}, '', `/palm-reading/report/${id}`);
    } else if (payment === 'cancelled') {
      setPaymentMsg('Payment cancelled.');
      window.history.replaceState({}, '', `/palm-reading/report/${id}`);
    }
  }, [id]);

  useEffect(() => {
    palmReadingAPI.getById(id)
      .then(setReport)
      .catch(() => setError('Failed to load reading'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (report?.analysis_status !== 'analyzing') return;
    retryCount.current = 0;
    pollingRef.current = setInterval(async () => {
      retryCount.current++;
      if (retryCount.current > 60) { clearInterval(pollingRef.current!); return; }
      try {
        const status = await palmReadingAPI.getStatus(id);
        if (status.analysis_status === 'complete') {
          const full = await palmReadingAPI.getById(id);
          setReport(full);
          clearInterval(pollingRef.current!);
        } else if (status.analysis_status === 'failed') {
          clearInterval(pollingRef.current!);
        }
      } catch {}
    }, 3000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [report?.analysis_status, id]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin text-3xl">🤚</div></div>;
  }
  if (error || !report) {
    return <div className="min-h-[60vh] flex items-center justify-center text-fire">{error || 'Reading not found'}</div>;
  }

  const isAnalyzing = report.analysis_status === 'analyzing';
  const isComplete = report.analysis_status === 'complete';
  const isPaid = report.is_paid;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Overall score */}
      <div className="bg-bg-card rounded-2xl p-8 border border-border text-center mb-6">
        <div className="flex justify-center items-center gap-2 mb-4 text-gold text-sm">
          <span className="w-6 h-px bg-gold" /><span className="font-bold text-text tracking-wider">Fortune Score</span><span className="w-6 h-px bg-gold" />
        </div>
        <div className="flex justify-center mb-4">
          <ScoreCircle score={report.overall_score} size={120} />
        </div>
        {report.overall_summary && (
          <p className="text-text-secondary text-sm leading-relaxed max-w-lg mx-auto">{report.overall_summary}</p>
        )}
      </div>

      {/* Payment message */}
      {paymentMsg && (
        <div className={`flex items-center justify-center gap-2 rounded-xl px-6 py-4 mb-6 border ${
          paymentMsg.includes('successful') ? 'bg-jade/10 border-jade text-jade' : 'bg-gold-light border-gold text-gold'
        }`}>
          <span className="font-semibold text-sm">{paymentMsg}</span>
        </div>
      )}

      {/* Analyzing banner */}
      {isAnalyzing && (
        <div className="bg-bg-card border border-gold rounded-xl px-6 py-5 mb-6 text-center">
          <span className="animate-spin inline-block text-2xl mb-2">🤚</span>
          <p className="text-gold font-semibold text-sm">Analyzing your palm lines in detail...</p>
          <p className="text-text-muted text-xs mt-1">This may take 1-2 minutes. Please stay on this page.</p>
        </div>
      )}

      {/* Areas overview (quick/analyzing) */}
      {!isPaid && !isComplete && report.areas && (
        <div className="bg-bg-card rounded-xl p-4 border border-border mb-6">
          <p className="text-xs font-bold text-gold tracking-wider uppercase mb-3">Life Areas Overview</p>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {report.areas.map((a: any, i: number) => (
              <div key={i} className="flex flex-col items-center min-w-[70px]">
                <ScoreCircle score={a.score} size={36} />
                <span className="text-[10px] text-text-secondary mt-1 text-center truncate w-full">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAID + COMPLETE */}
      {isPaid && isComplete && report.areas ? (
        <>
          {report.areas.map((a: any, i: number) => <FullAreaCard key={i} area={a} />)}

          {/* Life Stages */}
          {report.life_stages && (
            <div className="bg-bg-card rounded-2xl p-6 border border-border mb-4">
              <div className="flex items-center gap-2 mb-4 text-gold text-sm">
                <span className="w-6 h-px bg-gold" /><span className="font-bold text-text tracking-wider">Life Timeline</span><span className="w-6 h-px bg-gold" />
              </div>
              <div className="space-y-4">
                <div className="bg-[#FFF8F0] rounded-xl p-4 border-l-3 border-l-gold">
                  <span className="text-xs font-bold text-gold uppercase tracking-wider">Early Years (Before 30)</span>
                  <p className="text-sm text-text-secondary leading-relaxed mt-1">{report.life_stages.early_years}</p>
                </div>
                <div className="bg-[#F0F4FF] rounded-xl p-4 border-l-3 border-l-primary">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Middle Years (30-55)</span>
                  <p className="text-sm text-text-secondary leading-relaxed mt-1">{report.life_stages.middle_years}</p>
                </div>
                <div className="bg-[#F0F7F2] rounded-xl p-4 border-l-3 border-l-jade">
                  <span className="text-xs font-bold text-jade uppercase tracking-wider">Later Years (55+)</span>
                  <p className="text-sm text-text-secondary leading-relaxed mt-1">{report.life_stages.late_years}</p>
                </div>
              </div>
            </div>
          )}

          {/* General Tips */}
          {report.general_tips && (
            <div className="bg-bg-card rounded-2xl p-6 border border-border mb-4">
              <div className="flex items-center gap-2 mb-4 text-gold text-sm">
                <span className="w-6 h-px bg-gold" /><span className="font-bold text-text tracking-wider">Life Guidance</span><span className="w-6 h-px bg-gold" />
              </div>
              {report.general_tips.map((tip: string, i: number) => (
                <p key={i} className="text-sm text-text-secondary leading-relaxed mb-1">✦ {tip}</p>
              ))}
            </div>
          )}
        </>
      ) : isComplete ? (
        /* FREE + COMPLETE — wealth area with issues but suggestions locked */
        <>
          {report.first_area && <FreeAreaCard area={report.first_area} />}

          <div className="flex items-center gap-3 my-6">
            <span className="flex-1 h-px bg-primary/20" />
            <span className="text-primary font-semibold text-sm">🔒 Unlock Full Reading</span>
            <span className="flex-1 h-px bg-primary/20" />
          </div>

          {report.locked_areas?.map((a: any, i: number) => <LockedAreaCard key={i} area={a} />)}

          {/* Locked life stages teaser */}
          {report.has_life_stages && (
            <div className="bg-bg-card rounded-2xl p-6 border border-dashed border-text-muted mb-4 opacity-80">
              <div className="flex items-center justify-between bg-[#FFF8F0] rounded-lg px-4 py-2.5">
                <span className="text-sm text-gold font-medium">Life Timeline (Early / Middle / Late Years)</span>
                <span className="text-sm">🔒</span>
              </div>
            </div>
          )}

          <button
            onClick={async () => {
              setUnlocking(true);
              try {
                const data = await stripeAPI.createCheckout(report.id);
                window.location.href = data.url;
              } catch {
                setUnlocking(false);
                alert('Failed to start checkout. Please try again.');
              }
            }}
            disabled={unlocking}
            className="w-full bg-primary text-gold-light font-semibold py-4 rounded-xl text-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 mt-4 disabled:opacity-50"
          >
            {unlocking ? 'Redirecting to checkout...' : 'Unlock Full Reading — $0.01'}
          </button>
        </>
      ) : (
        /* QUICK / ANALYZING */
        <>
          {report.areas?.map((a: any, i: number) => <QuickAreaCard key={i} area={a} />)}
        </>
      )}

      <div className="text-center mt-8 text-gold text-sm tracking-[0.3em]">━━━ ✦ ━━━</div>
    </div>
  );
}

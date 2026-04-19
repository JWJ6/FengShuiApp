import Link from 'next/link';

const FEATURES = [
  {
    icon: '📸',
    title: 'Upload a Photo',
    desc: 'Take a picture of any room or upload a floor plan. Our AI analyzes the spatial energy instantly.',
  },
  {
    icon: '☯',
    title: 'Expert Analysis',
    desc: 'Receive a comprehensive Feng Shui report based on Form School, Compass School, and Five Elements theory.',
  },
  {
    icon: '✨',
    title: 'Actionable Solutions',
    desc: 'Get specific remedies — exact placements, colors, and cure items to harmonize your space.',
  },
];

const STATS = [
  { value: '40+', label: 'Feng Shui principles analyzed' },
  { value: '5', label: 'Areas per report' },
  { value: '< 30s', label: 'Quick results' },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-light/30 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="flex justify-center items-center gap-3 mb-6 text-gold text-sm tracking-[0.3em]">
            ━━━ ✦ ━━━
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-text tracking-tight leading-tight">
            Harmonize Your Space<br />
            <span className="text-primary">with AI Feng Shui</span>
          </h1>
          <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Upload a photo of your home and receive an instant, expert-level Feng Shui analysis.
            Discover hidden energy patterns and get actionable solutions to improve
            your wealth, health, and harmony.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center gap-2 bg-primary text-gold-light font-semibold px-8 py-4 rounded-xl text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
            >
              Analyze My Space ☯
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 border-2 border-border text-text-secondary font-semibold px-8 py-4 rounded-xl text-lg hover:border-primary hover:text-primary transition-colors"
            >
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-text">How It Works</h2>
            <div className="flex justify-center items-center gap-2 mt-3 text-gold text-sm">
              <span className="w-8 h-px bg-gold" />
              <span>◆</span>
              <span className="w-8 h-px bg-gold" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="bg-bg rounded-2xl p-8 border border-border hover:border-gold/50 transition-colors group"
              >
                <div className="w-14 h-14 rounded-xl bg-gold-light/50 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <div className="text-xs text-gold font-semibold tracking-widest mb-2">
                  STEP {i + 1}
                </div>
                <h3 className="text-lg font-bold text-text mb-2">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-text">Simple Pricing</h2>
          <div className="flex justify-center items-center gap-2 mt-3 mb-12 text-gold text-sm">
            <span className="w-8 h-px bg-gold" />
            <span>◆</span>
            <span className="w-8 h-px bg-gold" />
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-bg-card rounded-2xl p-8 border border-border text-left">
              <div className="text-sm font-semibold text-jade uppercase tracking-wider">Free</div>
              <div className="text-4xl font-bold mt-2 text-text">$0</div>
              <div className="text-text-muted text-sm mt-1">per analysis</div>
              <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                <li className="flex gap-2"><span className="text-jade">✓</span> Overall Feng Shui score</li>
                <li className="flex gap-2"><span className="text-jade">✓</span> Summary assessment</li>
                <li className="flex gap-2"><span className="text-jade">✓</span> 1 area with full details</li>
                <li className="flex gap-2"><span className="text-text-muted">○</span> <span className="text-text-muted">Other areas locked</span></li>
              </ul>
            </div>

            <div className="bg-bg-card rounded-2xl p-8 border-2 border-primary text-left relative">
              <div className="absolute -top-3 right-6 bg-primary text-gold-light text-xs font-bold px-3 py-1 rounded-full">
                FULL REPORT
              </div>
              <div className="text-sm font-semibold text-primary uppercase tracking-wider">Pro</div>
              <div className="text-4xl font-bold mt-2 text-text">$9.99</div>
              <div className="text-text-muted text-sm mt-1">per report</div>
              <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                <li className="flex gap-2"><span className="text-jade">✓</span> Everything in Free</li>
                <li className="flex gap-2"><span className="text-jade">✓</span> All areas with full details</li>
                <li className="flex gap-2"><span className="text-jade">✓</span> Detailed solutions & remedies</li>
                <li className="flex gap-2"><span className="text-jade">✓</span> General improvement tips</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gold-light">Ready to Transform Your Space?</h2>
          <p className="mt-4 text-gold-light/70">
            Join thousands who have improved their living environment with AI-powered Feng Shui guidance.
          </p>
          <Link
            href="/analyze"
            className="mt-8 inline-flex items-center gap-2 bg-gold text-primary-dark font-bold px-8 py-4 rounded-xl text-lg hover:bg-gold-light transition-colors"
          >
            Get Your Free Analysis
          </Link>
        </div>
      </section>
    </>
  );
}

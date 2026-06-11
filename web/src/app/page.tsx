import Link from 'next/link';

const SERVICES = [
  {
    icon: '☯',
    title: 'Feng Shui Analysis',
    desc: 'Upload photos of your home and receive expert-level Feng Shui analysis. Discover hidden energy patterns and solutions for wealth, health, and harmony.',
    href: '/analyze',
    cta: 'Analyze My Space',
    price: '$9.99',
    features: ['Up to 10 room photos', '5+ areas analyzed', 'Actionable Feng Shui remedies'],
  },
  {
    icon: '🤚',
    title: 'Palm Reading',
    desc: 'Upload a photo of your palm. Our AI fortune master reads your life lines and hand features to reveal your destiny.',
    href: '/palm-reading',
    cta: 'Read My Fortune',
    price: '$19.99',
    features: ['Palm line analysis', '5 life areas revealed', 'Personalized life guidance'],
  },
];

const FENGSHUI_STEPS = [
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

const PALM_STEPS = [
  {
    icon: '🧑',
    title: 'Upload Your Photos',
    desc: 'Take a clear photo of your dominant palm with fingers spread. Good lighting ensures the best reading.',
  },
  {
    icon: '🔮',
    title: 'AI Fortune Reading',
    desc: 'Our AI master analyzes your palm lines, hand shape, and facial features using ancient Chinese palmistry and physiognomy.',
  },
  {
    icon: '📜',
    title: 'Life Insights Report',
    desc: 'Get detailed insights into wealth, love, career, health, and destiny — with personalized guidance.',
  },
];

const STATS = [
  { value: '40+', label: 'Principles analyzed' },
  { value: '10', label: 'Life & space areas' },
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
            Discover Your Fortune<br />
            <span className="text-primary">with AI Wisdom</span>
          </h1>
          <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Ancient wisdom meets modern AI. Get expert Feng Shui analysis for your home or
            a personalized palm reading to reveal your life&apos;s path.
          </p>

          {/* Two service CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center gap-2 bg-primary text-gold-light font-semibold px-8 py-4 rounded-xl text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
            >
              Feng Shui Analysis ☯
            </Link>
            <Link
              href="/palm-reading"
              className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary font-semibold px-8 py-4 rounded-xl text-lg hover:bg-primary hover:text-gold-light transition-all"
            >
              Palm Reading 🤚
            </Link>
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

      {/* Services */}
      <section className="py-20 bg-bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-text">Our Services</h2>
            <div className="flex justify-center items-center gap-2 mt-3 text-gold text-sm">
              <span className="w-8 h-px bg-gold" /><span>◆</span><span className="w-8 h-px bg-gold" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {SERVICES.map((s) => (
              <div key={s.title} className="bg-bg rounded-2xl p-8 border border-border hover:border-gold/50 transition-colors group">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-xl font-bold text-text mb-2">{s.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">{s.desc}</p>
                <ul className="space-y-2 text-sm text-text-secondary mb-6">
                  {s.features.map((f) => (
                    <li key={f} className="flex gap-2"><span className="text-jade">✓</span> {f}</li>
                  ))}
                </ul>
                <Link
                  href={s.href}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-gold-light font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors w-full text-center"
                >
                  {s.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Feng Shui Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-text">How Feng Shui Analysis Works</h2>
            <div className="flex justify-center items-center gap-2 mt-3 text-gold text-sm">
              <span className="w-8 h-px bg-gold" /><span>◆</span><span className="w-8 h-px bg-gold" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FENGSHUI_STEPS.map((f, i) => (
              <div key={f.title} className="bg-bg-card rounded-2xl p-8 border border-border hover:border-gold/50 transition-colors group">
                <div className="w-14 h-14 rounded-xl bg-gold-light/50 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <div className="text-xs text-gold font-semibold tracking-widest mb-2">STEP {i + 1}</div>
                <h3 className="text-lg font-bold text-text mb-2">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Palm Reading Works */}
      <section className="py-20 bg-bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-text">How Palm Reading Works</h2>
            <div className="flex justify-center items-center gap-2 mt-3 text-gold text-sm">
              <span className="w-8 h-px bg-gold" /><span>◆</span><span className="w-8 h-px bg-gold" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PALM_STEPS.map((f, i) => (
              <div key={f.title} className="bg-bg rounded-2xl p-8 border border-border hover:border-gold/50 transition-colors group">
                <div className="w-14 h-14 rounded-xl bg-gold-light/50 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <div className="text-xs text-gold font-semibold tracking-widest mb-2">STEP {i + 1}</div>
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
            <span className="w-8 h-px bg-gold" /><span>◆</span><span className="w-8 h-px bg-gold" />
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-bg-card rounded-2xl p-8 border border-border text-left">
              <div className="text-sm font-semibold text-jade uppercase tracking-wider">Free</div>
              <div className="text-4xl font-bold mt-2 text-text">$0</div>
              <div className="text-text-muted text-sm mt-1">per analysis</div>
              <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                <li className="flex gap-2"><span className="text-jade">✓</span> Overall score</li>
                <li className="flex gap-2"><span className="text-jade">✓</span> Summary assessment</li>
                <li className="flex gap-2"><span className="text-jade">✓</span> 1 area preview</li>
                <li className="flex gap-2"><span className="text-text-muted">○</span> <span className="text-text-muted">Other areas locked</span></li>
              </ul>
            </div>

            <div className="bg-bg-card rounded-2xl p-8 border-2 border-primary text-left relative">
              <div className="absolute -top-3 right-6 bg-primary text-gold-light text-xs font-bold px-3 py-1 rounded-full">
                FENG SHUI
              </div>
              <div className="text-sm font-semibold text-primary uppercase tracking-wider">Full Report</div>
              <div className="text-4xl font-bold mt-2 text-text">$9.99</div>
              <div className="text-text-muted text-sm mt-1">per report</div>
              <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                <li className="flex gap-2"><span className="text-jade">✓</span> All areas unlocked</li>
                <li className="flex gap-2"><span className="text-jade">✓</span> Detailed solutions</li>
                <li className="flex gap-2"><span className="text-jade">✓</span> Feng Shui remedies</li>
                <li className="flex gap-2"><span className="text-jade">✓</span> General tips</li>
              </ul>
            </div>

            <div className="bg-bg-card rounded-2xl p-8 border-2 border-gold text-left relative">
              <div className="absolute -top-3 right-6 bg-gold text-primary-dark text-xs font-bold px-3 py-1 rounded-full">
                PALM READING
              </div>
              <div className="text-sm font-semibold text-gold uppercase tracking-wider">Full Reading</div>
              <div className="text-4xl font-bold mt-2 text-text">$19.99</div>
              <div className="text-text-muted text-sm mt-1">per reading</div>
              <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                <li className="flex gap-2"><span className="text-jade">✓</span> 5 life areas unlocked</li>
                <li className="flex gap-2"><span className="text-jade">✓</span> Detailed insights</li>
                <li className="flex gap-2"><span className="text-jade">✓</span> Personalized guidance</li>
                <li className="flex gap-2"><span className="text-jade">✓</span> Destiny reading</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gold-light">Ready to Discover Your Fortune?</h2>
          <p className="mt-4 text-gold-light/70">
            Ancient wisdom, powered by modern AI. Explore your space or reveal your destiny today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 bg-gold text-primary-dark font-bold px-8 py-4 rounded-xl text-lg hover:bg-gold-light transition-colors"
            >
              Feng Shui Analysis
            </Link>
            <Link
              href="/palm-reading"
              className="inline-flex items-center gap-2 bg-gold-light/20 text-gold-light font-bold px-8 py-4 rounded-xl text-lg hover:bg-gold-light/30 transition-colors border border-gold-light/30"
            >
              Palm Reading
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

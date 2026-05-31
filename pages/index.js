import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, e.target.dataset.section]));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('[data-section]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const visible = (id) => visibleSections.has(id);

  return (
    <>
      <Head>
        <title>FlashTrack — Order Tracking for Small Businesses</title>
        <meta name="description" content="Give your customers a professional order tracking page. ₹750/month. First month free. No tech skills needed." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="FlashTrack — Order Tracking for Small Businesses" />
        <meta property="og:description" content="Stop answering 'Where is my order?' every day. We handle it for you." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --gold:    #F5C518;
          --red:     #CC1F1F;
          --white:   #F9FAFB;
          --dark:    #0A0A0A;
          --dark2:   #111111;
          --dark3:   #1A1A1A;
          --muted:   #888888;
          --border:  #2A2A2A;
        }
        html { scroll-behavior: smooth; }
        body {
          background: var(--dark);
          color: var(--white);
          font-family: 'Barlow', sans-serif;
          font-size: 16px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; }

        .fade-up {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .fade-up.d1 { transition-delay: 0.1s; }
        .fade-up.d2 { transition-delay: 0.2s; }
        .fade-up.d3 { transition-delay: 0.3s; }
        .fade-up.d4 { transition-delay: 0.4s; }
        .fade-up.d5 { transition-delay: 0.5s; }

        .gold { color: var(--gold); }
        .red  { color: var(--red); }

        @keyframes bolt {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        .cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 36px;
          background: var(--gold);
          color: var(--dark);
          font-size: 17px; font-weight: 800;
          font-family: 'Barlow Condensed', sans-serif;
          letter-spacing: 0.05em; text-transform: uppercase;
          border: none; border-radius: 6px;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(245,197,24,0.3);
          position: relative; overflow: hidden;
        }
        .cta-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          background-size: 200%;
          animation: shimmer 2.5s infinite;
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 36px rgba(245,197,24,0.45);
        }

        .problem-card {
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 28px;
          background: var(--dark2);
          transition: border-color 0.3s, transform 0.3s;
        }
        .problem-card:hover {
          border-color: #444;
          transform: translateY(-4px);
        }

        .benefit-card {
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 32px 28px;
          background: var(--dark2);
          transition: border-color 0.3s, transform 0.3s;
          position: relative; overflow: hidden;
        }
        .benefit-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
        }
        .benefit-card.b1::before { background: linear-gradient(90deg, var(--gold), transparent); }
        .benefit-card.b2::before { background: linear-gradient(90deg, var(--red), transparent); }
        .benefit-card.b3::before { background: linear-gradient(90deg, #10B981, transparent); }
        .benefit-card:hover {
          border-color: #444;
          transform: translateY(-4px);
        }

        .step-num {
          width: 48px; height: 48px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 22px; font-weight: 900;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .benefits-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .pricing-inner { padding: 32px 24px !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '0 24px',
        background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'all 0.3s',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26, animation: 'bolt 2s infinite' }}>⚡</span>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: 22, letterSpacing: '0.05em',
          }}>
            <span style={{ color: 'var(--white)' }}>Flash</span>
            <span style={{ color: 'var(--gold)' }}>Track</span>
          </span>
        </div>

        <a href="#pricing" className="cta-btn" style={{ padding: '10px 22px', fontSize: 14 }}>
          Start Free
        </a>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '100px 24px 80px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,197,24,0.06) 0%, transparent 70%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background lightning bolts */}
        <div style={{
          position: 'absolute', top: '10%', right: '5%',
          fontSize: 180, opacity: 0.03, userSelect: 'none',
          fontFamily: 'serif', animation: 'spin-slow 30s linear infinite',
        }}>⚡</div>
        <div style={{
          position: 'absolute', bottom: '10%', left: '2%',
          fontSize: 120, opacity: 0.04, userSelect: 'none',
          animation: 'bolt 3s infinite',
        }}>⚡</div>

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            {/* Left */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 999,
                border: '1px solid rgba(245,197,24,0.3)',
                background: 'rgba(245,197,24,0.08)',
                fontSize: 13, fontWeight: 600, color: 'var(--gold)',
                marginBottom: 28, letterSpacing: '0.04em',
              }}>
                <span style={{ animation: 'bolt 1.5s infinite' }}>⚡</span>
                First month completely FREE
              </div>

              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900, fontSize: 'clamp(48px, 7vw, 80px)',
                lineHeight: 1.0, letterSpacing: '-0.02em',
                marginBottom: 24,
              }}>
                Stop Answering<br />
                <span style={{ color: 'var(--gold)' }}>"Where Is</span><br />
                <span style={{ color: 'var(--gold)' }}>My Order?"</span>
              </h1>

              <p style={{ fontSize: 18, color: '#BBBBBB', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
                FlashTrack gives your customers a <strong style={{ color: 'var(--white)' }}>live order tracking page</strong> — branded, simple, always up to date. You just forward us the slip. We handle everything else.
              </p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <a href="#pricing" className="cta-btn">
                  ⚡ Try Free for 1 Month
                </a>
                <a href="#how" style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: '#BBBBBB', fontSize: 15, fontWeight: 600,
                  padding: '16px 20px',
                  border: '1px solid var(--border)', borderRadius: 6,
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.borderColor = '#555'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#BBBBBB'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  See how it works →
                </a>
              </div>

              <div style={{ marginTop: 40, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                {[
                  { num: '₹750', label: 'per month' },
                  { num: '0', label: 'tech skills needed' },
                  { num: '1st', label: 'month free' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 900, fontSize: 32, color: 'var(--gold)',
                    }}>{s.num}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — mock tracking card */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '100%', maxWidth: 340,
                animation: 'float 4s ease-in-out infinite',
              }}>
                {/* Phone frame */}
                <div style={{
                  background: 'var(--dark2)', border: '1px solid var(--border)',
                  borderRadius: 24, overflow: 'hidden',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                }}>
                  {/* Fake header */}
                  <div style={{
                    background: 'rgba(10,10,10,0.9)', padding: '14px 18px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: '0.05em' }}>JOY BOUTIQUE</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em' }}>ORDER TRACKING</div>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '5px 10px', background: '#111',
                      border: '1px solid #222', borderRadius: 999,
                      fontSize: 10, color: '#888',
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                      Live
                    </div>
                  </div>

                  {/* Cards */}
                  <div style={{ padding: '14px 14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { name: 'Aisha Rahman', pin: '682006', id: 'R200025431', status: 'On the Way', color: '#60A5FA' },
                      { name: 'Priya Menon',  pin: '695001', id: 'EL778211IN', status: 'On the Way', color: '#60A5FA' },
                      { name: 'Fathima K',    pin: '673001', id: 'R200025298', status: 'Delivered', color: '#10B981' },
                    ].map((o, i) => (
                      <div key={i} style={{
                        background: 'linear-gradient(135deg, #0D1117, #111827)',
                        border: `1px solid ${o.status === 'Delivered' ? '#065F46' : '#1F2937'}`,
                        borderRadius: 14, padding: '12px 14px',
                        position: 'relative', overflow: 'hidden',
                      }}>
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                          background: `linear-gradient(90deg, ${o.color}80, transparent)`,
                        }} />
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{o.name}</div>
                        <div style={{ fontSize: 10, color: '#4B5563', fontFamily: 'monospace', marginBottom: 8 }}>📍 {o.pin}</div>
                        {o.status === 'Delivered' ? (
                          <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>✅ Delivered</div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 10, color: '#4B5563', fontFamily: 'monospace' }}>{o.id}</div>
                            <div style={{
                              padding: '3px 10px', borderRadius: 999,
                              background: '#064E3B', border: '1px solid #059669',
                              fontSize: 10, color: '#10B981', fontWeight: 700,
                            }}>📦 Track</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="problem" data-section="problem" style={{ padding: '96px 24px', background: 'var(--dark2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div
            className={`fade-up ${visible('problem') ? 'visible' : ''}`}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--red)', textTransform: 'uppercase', marginBottom: 14 }}>
              THE PROBLEM
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.05, letterSpacing: '-0.01em',
            }}>
              Small Businesses Are Losing<br />
              <span style={{ color: 'var(--red)' }}>Time, Money & Trust</span> Every Day
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                icon: '📱',
                title: '"Where is my order?"',
                body: 'You get this WhatsApp message 10 times a day. Each reply wastes 5 minutes. That is almost an hour every day just answering the same question.',
                delay: 'd1',
              },
              {
                icon: '📦',
                title: 'RTOs eating your profit',
                body: 'Customers who can\'t track their order panic and refuse delivery. Every RTO costs you ₹200–500 in return shipping. Plus the lost sale.',
                delay: 'd2',
              },
              {
                icon: '😰',
                title: '"Is this a scam?"',
                body: 'New customers hesitate to order. They\'ve been burned before. Without visible tracking, they lose trust and don\'t come back.',
                delay: 'd3',
              },
            ].map(p => (
              <div
                key={p.title}
                className={`problem-card fade-up ${p.delay} ${visible('problem') ? 'visible' : ''}`}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{p.icon}</div>
                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800, fontSize: 22, marginBottom: 12,
                  color: 'var(--white)',
                }}>{p.title}</h3>
                <p style={{ color: '#888', fontSize: 15, lineHeight: 1.7 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section id="benefits" data-section="benefits" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className={`fade-up ${visible('benefits') ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 14 }}>
              THE SOLUTION
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.05, letterSpacing: '-0.01em',
            }}>
              Three Problems.<br />
              <span style={{ color: 'var(--gold)' }}>One Simple Tool.</span>
            </h2>
          </div>

          <div className="benefits-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                cls: 'b1',
                icon: '🔗',
                tag: 'SAVE TIME',
                color: 'var(--gold)',
                title: 'One Link. Zero Daily Messages.',
                body: 'Send every customer the same tracking link. They open it, see their order live, no questions asked. You stop answering the same WhatsApp message 10 times a day.',
                stat: '1 hr',
                statLabel: 'saved every day',
                delay: 'd1',
              },
              {
                cls: 'b2',
                icon: '📉',
                tag: 'SAVE MONEY',
                color: 'var(--red)',
                title: 'Customers Who Can Track, Receive.',
                body: 'When customers see their order moving towards them daily, they stay ready. Fewer panics. Fewer refusals. RTOs drop dramatically and you keep your profit.',
                stat: '₹500',
                statLabel: 'saved per RTO avoided',
                delay: 'd2',
              },
              {
                cls: 'b3',
                icon: '🏆',
                tag: 'BUILD TRUST',
                color: '#10B981',
                title: 'A Pro Page That Builds Instant Trust.',
                body: '"Is this a real business?" — your tracking page answers that before the question is even asked. New customers see professionalism, place more orders, and come back.',
                stat: '3x',
                statLabel: 'more repeat customers',
                delay: 'd3',
              },
            ].map(b => (
              <div
                key={b.title}
                className={`benefit-card ${b.cls} fade-up ${b.delay} ${visible('benefits') ? 'visible' : ''}`}
              >
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: b.color, marginBottom: 16, textTransform: 'uppercase' }}>
                  {b.tag}
                </div>
                <div style={{ fontSize: 40, marginBottom: 18 }}>{b.icon}</div>
                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800, fontSize: 24, marginBottom: 14, lineHeight: 1.2,
                }}>{b.title}</h3>
                <p style={{ color: '#888', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>{b.body}</p>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 900, fontSize: 36, color: b.color,
                    lineHeight: 1,
                  }}>{b.stat}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{b.statLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" data-section="how" style={{ padding: '96px 24px', background: 'var(--dark2)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className={`fade-up ${visible('how') ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 14 }}>
              HOW IT WORKS
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.05,
            }}>
              Simpler Than You Think
            </h2>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { num: '01', icon: '📸', title: 'You Ship', body: 'After shipping, just click a photo of the tracking slip and send it to us on WhatsApp. Done.' },
              { num: '02', icon: '⚡', title: 'We Upload', body: 'Our team enters the details. Your customer\'s tracking card goes live on your page instantly.' },
              { num: '03', icon: '🔗', title: 'You Share', body: 'Send every customer your one FlashTrack link. They search their name and see their order live.' },
              { num: '04', icon: '😊', title: 'They Track', body: 'Customer tracks their order themselves. No more calls, no more messages, no more stress.' },
            ].map((s, i) => (
              <div
                key={s.num}
                className={`fade-up d${i+1} ${visible('how') ? 'visible' : ''}`}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  border: '2px solid rgba(245,197,24,0.3)',
                  background: 'rgba(245,197,24,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900, fontSize: 18, color: 'var(--gold)',
                }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800, fontSize: 20, marginBottom: 10,
                }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY / FOUNDER ── */}
      <section id="story" data-section="story" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className={`fade-up ${visible('story') ? 'visible' : ''}`} style={{
            border: '1px solid var(--border)',
            borderRadius: 16, padding: '48px 48px',
            background: 'var(--dark2)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -30, right: -30,
              fontSize: 160, opacity: 0.04, userSelect: 'none',
            }}>⚡</div>

            <div style={{
              fontSize: 13, fontWeight: 700, letterSpacing: '0.1em',
              color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 24,
            }}>OUR STORY</div>

            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 'clamp(28px, 4vw, 42px)',
              lineHeight: 1.1, marginBottom: 24,
            }}>
              We Were a Small Business Too.
            </h2>

            <p style={{ fontSize: 16, color: '#AAAAAA', lineHeight: 1.8, marginBottom: 20 }}>
              We ran <strong style={{ color: 'var(--white)' }}>WTFrame</strong> — a small wooden custom frame shop based in Kerala. Every day we'd get messages like "bhai tracking kab milega?" or "delivered hua kya?" It was exhausting and it was taking time away from actually running the business.
            </p>
            <p style={{ fontSize: 16, color: '#AAAAAA', lineHeight: 1.8, marginBottom: 20 }}>
              So we built a simple order tracking page just for ourselves. And something amazing happened — <strong style={{ color: 'var(--white)' }}>customer trust shot up immediately.</strong> New buyers felt safer. Repeat orders increased. RTOs dropped. The "where is my order" messages almost completely stopped.
            </p>
            <p style={{ fontSize: 16, color: '#AAAAAA', lineHeight: 1.8 }}>
              That internal tool is now FlashTrack — built specifically for small businesses like yours who deserve the same professional tools that big brands use, at a price that makes sense.
            </p>

            <div style={{
              marginTop: 32, paddingTop: 28, borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(245,197,24,0.15)', border: '2px solid rgba(245,197,24,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 18, color: 'var(--gold)',
              }}>S</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--white)' }}>Stebin</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Founder, FlashTrack · ex WTFrame</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" data-section="pricing" style={{ padding: '96px 24px', background: 'var(--dark2)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className={`fade-up ${visible('pricing') ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 14 }}>
              PRICING
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.05,
            }}>
              One Plan. No Surprises.
            </h2>
          </div>

          <div
            className={`fade-up d1 ${visible('pricing') ? 'visible' : ''}`}
            style={{
              border: '1px solid rgba(245,197,24,0.3)',
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 0 60px rgba(245,197,24,0.08)',
            }}
          >
            {/* Badge */}
            <div style={{
              background: 'var(--gold)', padding: '10px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 16, color: 'var(--dark)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              ⚡ First Month Completely Free — No Credit Card Needed
            </div>

            <div className="pricing-inner" style={{ padding: '48px 56px', background: 'var(--dark)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 8 }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900, fontSize: 72, color: 'var(--gold)', lineHeight: 1,
                }}>₹750</div>
                <div style={{ color: 'var(--muted)', fontSize: 16, marginBottom: 10 }}>/month</div>
              </div>
              <div style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 40 }}>
                After the free trial. Cancel anytime.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
                {[
                  'Your own branded order tracking page',
                  'We upload all tracking data daily from your WhatsApp slips',
                  'Dedicated support staff — real humans, not AI bots',
                  'Unlimited orders tracked every month',
                  'RTO risk alerts sent to you proactively',
                  'Works with India Post, DTDC, Delhivery, and more',
                  'One link to share everywhere — Instagram bio, WhatsApp, anywhere',
                  'No app to download, no software to learn',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ color: 'var(--gold)', fontSize: 16, marginTop: 2, flexShrink: 0 }}>⚡</span>
                    <span style={{ fontSize: 15, color: '#CCCCCC' }}>{f}</span>
                  </div>
                ))}
              </div>

              <a href="https://wa.me/917902411421?text=Hi!%20I%20want%20to%20try%20FlashTrack%20for%20free." target="_blank" rel="noreferrer" className="cta-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 18 }}>
                💬 Get Started Free on WhatsApp
              </a>

              <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--muted)' }}>
                We'll set up your tracking page in under 24 hours.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" data-section="faq" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className={`fade-up ${visible('faq') ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 14 }}>FAQ</div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 'clamp(32px, 5vw, 48px)',
            }}>Quick Answers</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { q: 'Do I need any technical knowledge?', a: 'None at all. Once we set up your page, your only job is to take a photo of the tracking slip and send it to us on WhatsApp. We handle everything else.' },
              { q: 'How do I share the tracking link with customers?', a: 'You get one permanent link (like flashtrack.io/yourbrand). Put it in your Instagram bio, send it in every order confirmation message, add it to your WhatsApp status. One link works for all customers, forever.' },
              { q: 'What courier services do you support?', a: 'India Post, DTDC, Delhivery, XpressBees, Blue Dart, Ecom Express, Ekart, Amazon Logistics, and more. If you have a tracking number, we\'ll figure out the carrier.' },
              { q: 'What happens after the free month?', a: 'We\'ll message you before the trial ends. If you love it (and we think you will), you continue at ₹750/month. No automatic charges, no surprises.' },
              { q: 'How quickly will my customers see their tracking?', a: 'Once you send us the slip image, we upload it the same day. Usually within a few hours during working hours.' },
              { q: 'Can I customise the page with my brand?', a: 'Yes. Your business name, custom message at the bottom, and more. It looks like your own branded page, not a generic tool.' },
            ].map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} visible={visible('faq')} delay={i * 50} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section data-section="final" style={{
        padding: '96px 24px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(245,197,24,0.06) 0%, transparent 70%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 64, marginBottom: 24, animation: 'bolt 2s infinite' }}>⚡</div>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: 'clamp(40px, 6vw, 64px)',
            lineHeight: 1.05, marginBottom: 20,
          }}>
            Your Customers Are<br />
            <span style={{ color: 'var(--gold)' }}>Waiting to Trust You.</span>
          </h2>
          <p style={{ fontSize: 17, color: '#AAAAAA', marginBottom: 40, lineHeight: 1.7 }}>
            Start your free month today. No credit card. No contracts. Just a better experience for your customers and fewer headaches for you.
          </p>
          <a href="https://wa.me/917902411421?text=Hi!%20I%20want%20to%20try%20FlashTrack%20for%20free." target="_blank" rel="noreferrer" className="cta-btn" style={{ fontSize: 18 }}>
            💬 Message Us on WhatsApp
          </a>
          <div style={{ marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
            We set up your page in under 24 hours.
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '32px 24px',
        background: 'var(--dark)', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 18,
            }}>
              <span>Flash</span><span style={{ color: 'var(--gold)' }}>Track</span>
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            Made in Kerala 🌴 · Helping small businesses grow
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            flashtrack.io
          </div>
        </div>
      </footer>
    </>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────
function FaqItem({ q, a, visible, delay }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: '1px solid var(--border)', borderRadius: 10,
        overflow: 'hidden', marginBottom: 2,
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#444'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '18px 22px',
          background: 'var(--dark2)', border: 'none',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', textAlign: 'left', gap: 16,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--white)', lineHeight: 1.4 }}>{q}</span>
        <span style={{
          fontSize: 18, color: 'var(--gold)', flexShrink: 0,
          transition: 'transform 0.3s',
          transform: open ? 'rotate(45deg)' : 'rotate(0)',
        }}>+</span>
      </button>
      {open && (
        <div style={{
          padding: '0 22px 18px',
          background: 'var(--dark2)',
          fontSize: 15, color: '#888', lineHeight: 1.7,
          borderTop: '1px solid var(--border)',
          paddingTop: 16,
        }}>
          {a}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

const BG_REFRESH_MS = 5 * 60 * 1000; // silent background refresh every 5 min

// ─── Static generation ────────────────────────────────────────────
export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { code } = params;
  const HQ = process.env.HQ_ENDPOINT;
  if (!HQ) return { props: { code, config: null }, revalidate: 60 };
  try {
    const res  = await fetch(`${HQ}?action=resolve&code=${code}`);
    const data = await res.json();
    if (!data.found) return { notFound: true, revalidate: 60 };
    return { props: { code, config: data }, revalidate: 300 };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────
function getInitials(name = '') {
  return name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '?';
}
function getAvatarColor(name = '') {
  const colors = ['#7C3AED','#DB2777','#D97706','#059669','#2563EB','#DC2626'];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

// ─── LiveDot ──────────────────────────────────────────────────────
function LiveDot() {
  return (
    <span style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center', width:16, height:16 }}>
      <span style={{ position:'absolute', width:'100%', height:'100%', borderRadius:'50%', background:'#10B981', opacity:0.4, animation:'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
      <span style={{ width:10, height:10, borderRadius:'50%', background:'#10B981' }} />
    </span>
  );
}

// ─── Pipeline ────────────────────────────────────────────────────
// 3 steps only. CSM never needs to touch anything except Transit→Delivered.
const PIPELINE = [
  { short: 'Order Created', icon: '📋' },
  { short: 'On the Way',    icon: '🚚' },
  { short: 'Delivered',     icon: '✅' },
];

// step 0 = Order Created (row added, no tracking yet — visually always done)
// step 1 = On the Way    (Transit — default status set by sheet onEdit)
// step 2 = Delivered     (CSM changes Transit → Delivered, that's it)
function getStep(status) {
  if (status === 'Delivered') return 2;
  return 1; // Transit or anything else = On the Way
}

const STATUS_DISPLAY = {
  'Transit':   { label: 'On the Way', icon: '🚚', color: '#60A5FA' },
  'Delivered': { label: 'Delivered',  icon: '✅', color: '#10B981' },
};

// ─── StatusPill ───────────────────────────────────────────────────
function StatusPill({ status }) {
  const s = STATUS_DISPLAY[status] || STATUS_DISPLAY['Transit'];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 13px', borderRadius: 999,
      background: s.color + '22',
      border: `1px solid ${s.color}44`,
      color: s.color, fontSize: 12, fontWeight: 600,
    }}>
      {s.icon} {s.label}
    </div>
  );
}

// ─── StepTimeline ─────────────────────────────────────────────────
function StepTimeline({ status }) {
  // step 0 is always done (order exists = created)
  const currentStep = getStep(status);

  return (
    <div style={{ marginTop: 14 }}>
      {/* Green progress bar */}
      <div style={{
        position: 'relative', height: 4,
        background: '#2D2A26', borderRadius: 999, margin: '0 6px',
      }}>
        <div style={{
          position: 'absolute', height: '100%', borderRadius: 999,
          width: `${(currentStep / (PIPELINE.length - 1)) * 100}%`,
          background: '#10B981', transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Step circles + labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        {PIPELINE.map((s, i) => {
          const done    = i < currentStep;
          const current = i === currentStep;
          return (
            <div key={i} style={{ textAlign: 'center', flex: 1 }}>
              {/* Circle */}
              <div style={{
                width: current ? 26 : 20,
                height: current ? 26 : 20,
                margin: '0 auto', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#FFFFFF',
                background: done    ? '#10B981'
                          : current ? '#F59E0B'
                          : '#374151',
                boxShadow: current ? '0 0 0 4px #F59E0B20' : 'none',
                transition: 'all 0.3s ease',
              }}>
                {done ? '✓' : i + 1}
              </div>
              {/* Label */}
              <div style={{
                marginTop: 6, fontSize: 9, lineHeight: 1.3,
                fontWeight: current ? 700 : 500,
                color: current ? '#FFFFFF' : done ? '#D1D5DB' : '#6B7280',
              }}>{s.short}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TrackingCard ─────────────────────────────────────────────────
function TrackingCard({ order, isNew }) {
  const [copied, setCopied] = useState(false);
  const avatarBg    = getAvatarColor(order.name);
  const hasTracking = !!order.trackingId;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div style={{
      background: '#0D1117', border: '1px solid #1F2937',
      borderRadius: 20, padding: '18px 18px 16px',
      animation: 'cardIn 0.4s ease both', position: 'relative',
    }}>
      {isNew && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: '#92400e', color: '#fcd34d',
          fontSize: 10, fontWeight: 700, padding: '2px 9px',
          borderRadius: 999, letterSpacing: '0.06em',
        }}>NEW</div>
      )}

      {/* Avatar + Name row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', background: avatarBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0,
          fontFamily: "'Syne', sans-serif",
        }}>{getInitials(order.name)}</div>

        <div style={{ minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 16, color: '#F9FAFB',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{order.name}</div>
          <div style={{
            fontSize: 12, color: '#6B7280', marginTop: 2,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {order.orderId && (
              <span style={{ fontFamily: 'monospace', letterSpacing: '-0.3px' }}>{order.orderId}</span>
            )}
            {order.orderId && order.pincode && <span>·</span>}
            {order.pincode && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                📍 <strong style={{ color: '#9CA3AF', fontWeight: 700 }}>{order.pincode}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status pill */}
      <StatusPill status={order.status || 'Order Created'} />

      {/* Step timeline */}
      <StepTimeline status={order.status} />

      {/* Tracking ID + copy */}
      {order.trackingId && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#080d17', border: '1px solid #1a2035',
          borderRadius: 10, padding: '8px 12px', marginTop: 14,
        }}>
          <span style={{
            flex: 1, fontStyle: 'italic', fontWeight: 700,
            fontSize: 13, color: '#A78BFA', letterSpacing: '0.4px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{order.trackingId}</span>

          <button onClick={handleCopy} style={{
            background: copied ? '#052e16' : '#1F2937',
            color: copied ? '#4ade80' : '#9CA3AF',
            border: 'none', borderRadius: 6, padding: '5px 11px',
            fontSize: 11, cursor: 'pointer', fontWeight: 600,
            transition: 'all 0.2s', flexShrink: 0,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>
      )}

      {/* Big Live Tracking button */}
      {order.trackingLink && (
        <a href={order.trackingLink} target="_blank" rel="noreferrer" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          marginTop: 12, padding: '14px 20px', borderRadius: 14,
          background: 'linear-gradient(135deg, #1a3a8f, #1D4ED8)',
          color: '#fff', fontSize: 15, fontWeight: 700,
          textDecoration: 'none', letterSpacing: '-0.2px',
          boxShadow: '0 6px 24px #1D4ED835',
          border: '1px solid #2563eb60',
        }}>
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 10, height: 10, flexShrink: 0 }}>
            <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#60A5FA', opacity: 0.5, animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#93C5FD' }} />
          </span>
          📍 Live Tracking
        </a>
      )}
    </div>
  );
}

// ─── BottomBar ────────────────────────────────────────────────────
function BottomBar({ bar }) {
  if (!bar || !bar.text || bar.active === false) return null;
  const isBtn = bar.mode === 'button' && bar.link;
  const inner = (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center', gap:10,
      padding:'14px 20px',
      background:'linear-gradient(135deg, #064E3B, #065F46)',
      border:'1px solid #059669', borderRadius:16,
      color:'#10B981', fontSize:14, fontWeight:600,
      textDecoration:'none', boxShadow:'0 4px 24px #05966920',
    }}>
      <span style={{ fontSize:18 }}>💬</span>
      <span>{bar.text}</span>
    </div>
  );
  return (
    <div style={{
      position:'fixed', bottom:0, left:0, right:0,
      padding:'12px 16px 20px',
      background:'linear-gradient(to top, #030712 60%, transparent)',
      zIndex:50,
    }}>
      <div style={{ maxWidth:560, margin:'0 auto' }}>
        {isBtn ? <a href={bar.link} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>{inner}</a> : inner}
      </div>
    </div>
  );
}

// ─── SuspendedPage ────────────────────────────────────────────────
function SuspendedPage({ brandName }) {
  return (
    <div style={{
      minHeight:'100vh', background:'#030712', display:'flex',
      alignItems:'center', justifyContent:'center',
      fontFamily:"'DM Sans',sans-serif", padding:24,
    }}>
      <div style={{ maxWidth:400, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:52, marginBottom:20 }}>⏸️</div>
        <div style={{
          fontSize:20, fontWeight:800, color:'#F9FAFB',
          fontFamily:"'Syne',sans-serif", marginBottom:10,
        }}>{brandName.toUpperCase()}</div>
        <div style={{
          background:'#0D1117', border:'1px solid #292524',
          borderRadius:20, padding:'28px 24px',
        }}>
          <div style={{
            display:'inline-block', background:'#451a0340',
            border:'1px solid #92400e60', borderRadius:8,
            padding:'4px 14px', fontSize:11, fontWeight:700,
            color:'#fbbf24', letterSpacing:'0.08em', marginBottom:18,
          }}>SERVICE PAUSED</div>

          <p style={{ color:'#D1D5DB', fontSize:15, lineHeight:1.7, marginBottom:16 }}>
            Order tracking for this business is temporarily unavailable.
          </p>
          <p style={{ color:'#6B7280', fontSize:13, lineHeight:1.6 }}>
            If you placed an order, please contact the business directly for updates.
            We apologise for the inconvenience.
          </p>
        </div>
        <p style={{ fontSize:11, color:'#374151', marginTop:24 }}>
          Powered by EasyOrderTracking
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function TrackingPage({ code, config }) {
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState('');
  const [syncTime,  setSyncTime]  = useState('');

  const fetchOrders = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res  = await fetch(`/api/orders?code=${code}&t=${Date.now()}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOrders(data.orders || []);
      setSyncTime(new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }));
      setError(null);
    } catch (e) {
      setError('Could not refresh. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [code]);

  // Initial load + silent background refresh every 5 min
  useEffect(() => {
    fetchOrders();
    const iv = setInterval(() => fetchOrders(false), BG_REFRESH_MS);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return o.name?.toLowerCase().includes(q) || o.orderId?.toLowerCase().includes(q);
  });

  // ── Suspended state ──
  if (config?.suspended) {
    return (
      <>
        <Head>
          <title>Service Paused</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="robots" content="noindex" />
          <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,600&display=swap" rel="stylesheet" />
        </Head>
        <style>{`*{margin:0;padding:0;box-sizing:border-box;}`}</style>
        <SuspendedPage brandName={config.brandName || 'This Store'} />
      </>
    );
  }

  const brandName = config?.brandName || 'Order Tracking';
  const bottomBar = config?.bottomBar;

  return (
    <>
      <Head>
        <title>{brandName} — Order Status</title>
        <meta name="description" content={`Track your order from ${brandName} in real time.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#030712" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#030712;color:#F9FAFB;font-family:'DM Sans',sans-serif;min-height:100vh;padding-bottom:120px;-webkit-font-smoothing:antialiased;}
        @keyframes ping{75%,100%{transform:scale(2);opacity:0;}}
        @keyframes cardIn{from{opacity:0;transform:translateY(20px) scale(0.97);}to{opacity:1;transform:none;}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        input{border:none;outline:none;}
        a{transition:opacity 0.2s;}a:hover{opacity:0.85;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#1F2937;border-radius:4px;}
        .skeleton{background:linear-gradient(90deg,#111827 25%,#1F2937 50%,#111827 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:20px;}
        input::placeholder{color:#9CA3AF;}
        button{font-family:'DM Sans',sans-serif;}
      `}</style>

      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:'radial-gradient(ellipse 80% 50% at 50% -10%, #1a0a2e20 0%, transparent 70%)' }} />

      {/* ── Header ── */}
      <header style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(3,7,18,0.88)', backdropFilter:'blur(20px)',
        WebkitBackdropFilter:'blur(20px)', borderBottom:'1px solid #0D1117',
      }}>
        <div style={{ maxWidth:560, margin:'0 auto', padding:'14px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{
                fontSize:18, fontWeight:800, fontFamily:"'Syne',sans-serif",
                letterSpacing:'-0.5px',
                background:'linear-gradient(135deg, #F9FAFB 0%, #9CA3AF 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>{brandName.toUpperCase()}</div>
              <div style={{ fontSize:12, color:'#FFFFFF', letterSpacing:'0.08em', marginTop:1 }}>
                ORDER TRACKING
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
  <div style={{
    display:'flex', alignItems:'center', gap:8,
    padding:'6px 12px', background:'#0D1117',
    border:'1px solid #1F2937', borderRadius:999,
  }}>
    <LiveDot />
    <span style={{ fontSize:11, color:'#6B7280' }}>
      {syncTime || 'Connecting'}
    </span>
  </div>

  <button
    onClick={() => fetchOrders(true)}
    disabled={refreshing}
    style={{
      display:'flex', alignItems:'center', gap:6,
      padding:'7px 16px',
      background: refreshing ? '#1F2937' : '#1D4ED8',
      border:'none', borderRadius:999,
      color:'#fff', fontSize:12, fontWeight:600,
      cursor: refreshing ? 'default' : 'pointer',
      transition:'all 0.2s',
      fontFamily:"'DM Sans',sans-serif",
    }}
  >
    <span style={{
      display:'inline-block',
      animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
    }}>🔄</span>
    {refreshing ? 'Refreshing…' : 'Refresh'}
  </button>
</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:560, margin:'0 auto', padding:'0 16px', position:'relative', zIndex:1 }}>

        {/* ── Search ── */}
        {config?.showSearch !== false && (
          <div style={{ position:'sticky', top:52, zIndex:50, paddingTop:12, paddingBottom:10, background:'#030712' }}>
            <div style={{ position:'relative' }}>
              <span style={{
                position:'absolute', left:16, top:'50%', transform:'translateY(-50%)',
                fontSize:16, color:'#6B7280', pointerEvents:'none',
              }}>🔍</span>
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or order ID..."
                style={{
                  width:'100%', padding:'14px 16px 14px 46px',
                  background:'#FFFFFF', border:'1px solid #E5E7EB',
                  borderRadius:16, color:'#111827', fontSize:14, fontWeight:500,
                  fontFamily:"'DM Sans',sans-serif",
                  boxShadow:'0 4px 20px rgba(0,0,0,0.2)', transition:'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor='#F59E0B80'; e.target.style.boxShadow='0 0 0 3px #F59E0B15'; }}
                onBlur={e  => { e.target.style.borderColor='#E5E7EB'; e.target.style.boxShadow='0 4px 20px rgba(0,0,0,0.2)'; }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{
                  position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                  background:'#F3F4F6', border:'none', color:'#111827',
                  width:22, height:22, borderRadius:'50%', cursor:'pointer', fontSize:12,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>✕</button>
              )}
            </div>
          </div>
        )}

        {/* ── Skeletons ── */}
        {loading && (
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:8 }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height:170, opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div style={{
            padding:14, marginTop:8, marginBottom:12,
            background:'#1C0A0A', border:'1px solid #7F1D1D40',
            borderRadius:14, color:'#FCA5A5', fontSize:13,
            display:'flex', alignItems:'center', gap:10,
          }}>⚠️ {error}</div>
        )}

        {/* ── Section header with refresh button ── */}
        {!loading && (
          <div style={{
            display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:12, marginTop:8,
          }}>
            <span style={{ fontSize:11, color:'#FFFFFF', letterSpacing:'0.08em', fontWeight:600 }}>
              {search ? `${filtered.length} RESULT${filtered.length !== 1 ? 'S' : ''}` : 'LIVE ORDERS'}
            </span>

            {/* Manual refresh button */}
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              style={{
                display:'flex', alignItems:'center', gap:5,
                background:'transparent', border:'1px solid #1F2937',
                borderRadius:999, padding:'4px 12px',
                color: refreshing ? '#374151' : '#6B7280',
                fontSize:11, cursor: refreshing ? 'default' : 'pointer',
                transition:'all 0.2s',
              }}
            >
              <span style={{
                display:'inline-block',
                animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
              }}>🔄</span>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'64px 0', animation:'fadeIn 0.4s ease' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>{search ? '🔍' : '📦'}</div>
            <div style={{ fontSize:18, color:'#FFFFFF', fontWeight:600 }}>
              {search ? `No results for "${search}"` : 'No active orders right now'}
            </div>
            <div style={{ fontSize:14, color:'#6B7280', marginTop:8 }}>
              {search ? 'Try a different name or order ID' : 'Check back soon'}
            </div>
          </div>
        )}

        {/* ── Cards ── */}
        {!loading && filtered.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {filtered.map((order, i) => (
              <TrackingCard
                key={order.orderId || i}
                order={order}
                isNew={order.isNew && !search && i === 0}
              />
            ))}
          </div>
        )}

      </main>

      {bottomBar && <BottomBar bar={bottomBar} />}
    </>
  );
}

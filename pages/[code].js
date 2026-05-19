import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';

const REFRESH_SECONDS = 30;

// ─── Static generation ────────────────────────────────────────────
export async function getStaticPaths() {
  // No pre-rendered paths; new codes are generated on first visit
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { code } = params;
  const HQ = process.env.HQ_ENDPOINT;

  if (!HQ) {
    return { props: { code, config: null }, revalidate: 60 };
  }

  try {
    const res  = await fetch(`${HQ}?action=resolve&code=${code}`);
    const data = await res.json();
    if (!data.found) return { notFound: true, revalidate: 60 };
    return { props: { code, config: data }, revalidate: 300 }; // 5-min ISR; CSM can force-clear via Update Website button
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

// ─── TrackingCard ─────────────────────────────────────────────────
function TrackingCard({ order, isNew }) {
  const [copied, setCopied] = useState(false);
  const avatarBg    = getAvatarColor(order.name);
  const isDelivered = order.status === 'Delivered';

  const pillStyle = {
    display:'inline-flex', alignItems:'center', gap:5,
    padding:'5px 12px', borderRadius:999, fontSize:12, fontWeight:600,
    background: isDelivered ? '#052e16' : '#451a03',
    color:      isDelivered ? '#4ade80' : '#fbbf24',
    border:    `1px solid ${isDelivered ? '#4ade8030' : '#fbbf2430'}`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div style={{
      background:'#0D1117', border:'1px solid #1F2937',
      borderRadius:20, padding:'18px 18px 14px',
      animation:'cardIn 0.4s ease both', position:'relative',
    }}>
      {/* NEW badge */}
      {isNew && (
        <div style={{
          position:'absolute', top:14, right:14,
          background:'#92400e', color:'#fcd34d',
          fontSize:10, fontWeight:700, padding:'2px 9px',
          borderRadius:999, letterSpacing:'0.06em',
        }}>NEW</div>
      )}

      {/* Avatar + name row */}
      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14 }}>
        <div style={{
          width:42, height:42, borderRadius:'50%', background:avatarBg,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:15, fontWeight:700, color:'#fff', flexShrink:0,
          fontFamily:"'Syne',sans-serif",
        }}>{getInitials(order.name)}</div>

        <div style={{ minWidth:0, flex:1 }}>
          <div style={{
            fontWeight:700, fontSize:16, color:'#F9FAFB',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          }}>{order.name}</div>

          <div style={{ fontSize:12, color:'#6B7280', marginTop:3, display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            {order.orderId && <span style={{ fontFamily:'monospace', letterSpacing:'-0.3px' }}>{order.orderId}</span>}
            {order.orderId && order.pincode && <span>·</span>}
            {order.pincode && (
              <span style={{ display:'flex', alignItems:'center', gap:3 }}>
                📍 <span style={{ fontWeight:700, color:'#9CA3AF' }}>{order.pincode}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status + action buttons */}
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <div style={pillStyle}>
          {isDelivered ? '✓' : '🚚'} {order.status}
        </div>

        {order.trackingId && (
          <button onClick={handleCopy} style={{
            background:'#1F2937', color: copied ? '#4ade80' : '#D1D5DB',
            border:'1px solid #374151', borderRadius:999,
            padding:'5px 12px', fontSize:12, cursor:'pointer', fontWeight:500,
            transition:'color 0.2s',
          }}>
            {copied ? '✓ Copied' : '📋 Copy ID'}
          </button>
        )}

        {/* Track button — always visible regardless of status */}
        {order.trackingLink && (
          <a href={order.trackingLink} target="_blank" rel="noreferrer" style={{
            background:'#1D4ED8', color:'#fff', borderRadius:999,
            padding:'5px 14px', fontSize:12, fontWeight:600,
            textDecoration:'none', display:'inline-block',
          }}>Track →</a>
        )}
      </div>

      {/* Shipped date */}
      {order.shippedOn && (
        <div style={{ fontSize:11, color:'#4B5563', marginTop:10 }}>
          Shipped {order.shippedOn}
        </div>
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
      padding:'15px 20px',
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
        {isBtn ? (
          <a href={bar.link} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
            {inner}
          </a>
        ) : inner}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function TrackingPage({ code, config }) {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [ticker,   setTicker]   = useState(REFRESH_SECONDS);
  const [search,   setSearch]   = useState('');
  const [syncTime, setSyncTime] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const res  = await fetch(`/api/orders?code=${code}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOrders(data.orders || []);
      setSyncTime(new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }));
      setError(null);
    } catch (e) {
      setError('Could not refresh. Check your connection.');
    } finally {
      setLoading(false);
      setTicker(REFRESH_SECONDS);
    }
  }, [code]);

  // Initial fetch + polling
  useEffect(() => {
    fetchOrders();
    const iv = setInterval(fetchOrders, REFRESH_SECONDS * 1000);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  // Countdown ticker
  useEffect(() => {
    const t = setInterval(() => setTicker(n => n > 0 ? n - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      o.name?.toLowerCase().includes(q) ||
      o.orderId?.toLowerCase().includes(q)
    );
  });

  const brandName = config?.brandName || 'Order Tracking';
  const tagline   = config?.tagline   || 'Live Order Status';
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
        input{border:none;outline:none;}
        a{transition:opacity 0.2s;}a:hover{opacity:0.85;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#1F2937;border-radius:4px;}
        .skeleton{background:linear-gradient(90deg,#111827 25%,#1F2937 50%,#111827 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:20px;}
        input::placeholder{color:#9CA3AF;}
        button{font-family:'DM Sans',sans-serif;}
      `}</style>

      {/* bg radial gradient */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:'radial-gradient(ellipse 80% 50% at 50% -10%, #1a0a2e20 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, #0a1a1215 0%, transparent 60%)' }} />

      {/* ── Sticky Header ── */}
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
              }}>
                {brandName.toUpperCase()}
              </div>
              <div style={{ fontSize:12, color:'#FFFFFF', letterSpacing:'0.08em', marginTop:1 }}>
                ORDER TRACKING
              </div>
            </div>

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
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth:560, margin:'0 auto', padding:'0 16px', position:'relative', zIndex:1 }}>

        {/* Search — sticky below header */}
        {config?.showSearch !== false && (
          <div style={{
            position:'sticky', top:52, zIndex:50,
            paddingTop:12, paddingBottom:10, background:'#030712',
          }}>
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
                  boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
                  transition:'all 0.2s',
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

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:8 }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height:138, opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            padding:14, marginTop:8, marginBottom:12,
            background:'#1C0A0A', border:'1px solid #7F1D1D40',
            borderRadius:14, color:'#FCA5A5', fontSize:13,
            display:'flex', alignItems:'center', gap:10,
          }}>⚠️ {error}</div>
        )}

        {/* Section header */}
        {!loading && (
          <div style={{
            display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:12, marginTop:8,
          }}>
            <span style={{ fontSize:11, color:'#FFFFFF', letterSpacing:'0.08em', fontWeight:600 }}>
              {search ? `${filtered.length} RESULT${filtered.length !== 1 ? 'S' : ''}` : 'LIVE ORDERS'}
            </span>
            <span style={{ fontSize:11, color:'#FACC15', fontWeight:500 }}>
              Refreshing in {ticker}s
            </span>
          </div>
        )}

        {/* Empty state */}
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

        {/* Order cards */}
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

      {/* Bottom bar */}
      {bottomBar && <BottomBar bar={bottomBar} />}
    </>
  );
}

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

const BG_REFRESH_MS = 5 * 60 * 1000;

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

// ─── Localization ─────────────────────────────────────────────────
const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ml', label: 'മല', name: 'Malayalam' },
  { code: 'ta', label: 'த',  name: 'Tamil' },
  { code: 'hi', label: 'हि', name: 'Hindi' },
  { code: 'kn', label: 'ಕ',  name: 'Kannada' },
  { code: 'te', label: 'తె', name: 'Telugu' },
];

const T = {
  en: {
    orderTracking:   'ORDER TRACKING',
    tapToRefresh:    'Tap to refresh',
    updating:        'Updating…',
    searchPlaceholder: 'Search by name or order ID...',
    liveOrders:      'LIVE ORDERS',
    results:         n => `${n} RESULT${n !== 1 ? 'S' : ''}`,
    noOrders:        'No active orders right now',
    checkBackSoon:   'Check back soon',
    noResultsFor:    q => `No results for "${q}"`,
    tryDifferent:    'Try a different name or order ID',
  },
  ml: {
    orderTracking:   'ഓർഡർ ട്രാക്കിംഗ്',
    tapToRefresh:    'പുതുക്കാൻ ടാപ്പ് ചെയ്യുക',
    updating:        'അപ്ഡേറ്റ് ചെയ്യുന്നു…',
    searchPlaceholder: 'പേര് അല്ലെങ്കിൽ ഓർഡർ ID തിരയുക...',
    liveOrders:      'തത്സമയ ഓർഡറുകൾ',
    results:         n => `${n} ഫലം`,
    noOrders:        'ഇപ്പോൾ സജീവ ഓർഡറുകൾ ഇല്ല',
    checkBackSoon:   'പിന്നീട് വീണ്ടും നോക്കൂ',
    noResultsFor:    q => `"${q}" ന് ഫലമൊന്നുമില്ല`,
    tryDifferent:    'മറ്റൊരു പേര് അല്ലെങ്കിൽ ID ഉപയോഗിക്കുക',
  },
  ta: {
    orderTracking:   'ஆர்டர் கண்காணிப்பு',
    tapToRefresh:    'புதுப்பிக்க தட்டவும்',
    updating:        'புதுப்பிக்கிறது…',
    searchPlaceholder: 'பெயர் அல்லது ஆர்டர் ID தேடுக...',
    liveOrders:      'நேரடி ஆர்டர்கள்',
    results:         n => `${n} முடிவு`,
    noOrders:        'இப்போது செயலில் உள்ள ஆர்டர்கள் இல்லை',
    checkBackSoon:   'சற்று நேரம் கழித்து பாருங்கள்',
    noResultsFor:    q => `"${q}" க்கு முடிவு இல்லை`,
    tryDifferent:    'வேறு பெயர் அல்லது ID முயற்சிக்கவும்',
  },
  hi: {
    orderTracking:   'ऑर्डर ट्रैकिंग',
    tapToRefresh:    'रिफ्रेश करने के लिए टैप करें',
    updating:        'अपडेट हो रहा है…',
    searchPlaceholder: 'नाम या ऑर्डर ID खोजें...',
    liveOrders:      'लाइव ऑर्डर',
    results:         n => `${n} परिणाम`,
    noOrders:        'अभी कोई सक्रिय ऑर्डर नहीं',
    checkBackSoon:   'थोड़ी देर बाद देखें',
    noResultsFor:    q => `"${q}" के लिए कोई परिणाम नहीं`,
    tryDifferent:    'कोई अलग नाम या ID आज़माएं',
  },
  kn: {
    orderTracking:   'ಆರ್ಡರ್ ಟ್ರ್ಯಾಕಿಂಗ್',
    tapToRefresh:    'ರಿಫ್ರೆಶ್ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    updating:        'ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ…',
    searchPlaceholder: 'ಹೆಸರು ಅಥವಾ ಆರ್ಡರ್ ID ಹುಡುಕಿ...',
    liveOrders:      'ನೇರ ಆರ್ಡರ್‌ಗಳು',
    results:         n => `${n} ಫಲಿತಾಂಶ`,
    noOrders:        'ಇದೀಗ ಸಕ್ರಿಯ ಆರ್ಡರ್‌ಗಳಿಲ್ಲ',
    checkBackSoon:   'ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ನೋಡಿ',
    noResultsFor:    q => `"${q}" ಗೆ ಫಲಿತಾಂಶಗಳಿಲ್ಲ`,
    tryDifferent:    'ಬೇರೆ ಹೆಸರು ಅಥವಾ ID ಪ್ರಯತ್ನಿಸಿ',
  },
  te: {
    orderTracking:   'ఆర్డర్ ట్రాకింగ్',
    tapToRefresh:    'రిఫ్రెష్ చేయడానికి నొక్కండి',
    updating:        'అప్‌డేట్ అవుతోంది…',
    searchPlaceholder: 'పేరు లేదా ఆర్డర్ ID వెతకండి...',
    liveOrders:      'లైవ్ ఆర్డర్లు',
    results:         n => `${n} ఫలితాలు`,
    noOrders:        'ప్రస్తుతం చురుకైన ఆర్డర్లు లేవు',
    checkBackSoon:   'కొంత సేపటికి మళ్ళీ చూడండి',
    noResultsFor:    q => `"${q}" కి ఫలితాలు లేవు`,
    tryDifferent:    'వేరే పేరు లేదా ID ప్రయత్నించండి',
  },
};

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

const ACCENT = {
  'Transit':   '#60A5FA',
  'Delivered': '#10B981',
};

// ─── Avatar ────────────────────────────────────────────────────────
function Avatar({ name }) {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: '50%',
      background: getAvatarColor(name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0,
      fontFamily: "'Syne', sans-serif", letterSpacing: '-0.5px',
    }}>
      {getInitials(name)}
    </div>
  );
}

// ─── OrderCard ─────────────────────────────────────────────────────
function OrderCard({ order, index, isNew }) {
  const [copied, setCopied] = useState(false);
  const isDelivered = order.status === 'Delivered';
  const accentColor = ACCENT[order.status] || '#374151';
  const link        = order.trackingLink;
  const trackingId  = order.trackingId || order.orderId || '';

  function copyId() {
    if (!trackingId) return;
    navigator.clipboard.writeText(trackingId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0D1117 0%, #111827 100%)',
        border: `1px solid ${isDelivered ? '#065F46' : '#1F2937'}`,
        borderRadius: 20, padding: '16px 18px',
        position: 'relative', overflow: 'hidden',
        animation: `cardIn 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s both`,
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accentColor}80, ${accentColor}20, transparent)`,
      }} />

      {/* NEW badge */}
      {isNew && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          padding: '2px 8px', borderRadius: 999,
          background: '#78350F', color: '#FCD34D',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
        }}>NEW</div>
      )}

      {/* Avatar + name */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Avatar name={order.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              fontSize: 16, fontWeight: 700, color: '#F9FAFB',
              fontFamily: "'Syne', sans-serif",
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{order.name}</div>
            {isDelivered && <span style={{ fontSize: 15, flexShrink: 0 }}>✅</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <span style={{ fontSize: 11, color: '#4B5563', fontFamily: 'monospace' }}>
              {order.orderId}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#374151' }} />
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>📍 {order.pincode}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 12, paddingTop: 12, borderTop: '1px solid #1A2030',
      }}>
        {/* Copyable tracking ID */}
        <button
          onClick={copyId}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: '1px solid #1F2937',
            borderRadius: 8, padding: '5px 10px', cursor: trackingId ? 'pointer' : 'default',
            color: copied ? '#10B981' : '#6B7280',
            fontSize: 11, fontFamily: 'monospace',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { if (trackingId) e.currentTarget.style.borderColor = '#374151'; }}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#1F2937'}
        >
          <span style={{ fontSize: 12 }}>{copied ? '✓' : '⎘'}</span>
          {copied ? 'Copied!' : (trackingId || '—')}
        </button>

        {link && (
          <a
            href={link}
            target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 14px', borderRadius: 999,
              background: '#064E3B', border: '1px solid #059669',
              color: '#10B981', fontSize: 11, fontWeight: 600, textDecoration: 'none',
            }}
          >
            📦 Track
          </a>
        )}
      </div>
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

// ─── LangPicker ───────────────────────────────────────────────────
function LangPicker({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const current = LANGS.find(l => l.code === lang) || LANGS[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 10px', background: '#0D1117',
          border: '1px solid #1F2937', borderRadius: 999,
          cursor: 'pointer', color: '#F9FAFB',
          fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600,
        }}
      >
        <span style={{ fontSize: 13 }}>🌐</span>
        <span>{current.label}</span>
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 200 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 201,
            background: '#0D1117', border: '1px solid #1F2937', borderRadius: 14,
            overflow: 'hidden', minWidth: 140,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 14px', background: 'none',
                  border: 'none', borderBottom: '1px solid #111827',
                  cursor: 'pointer', textAlign: 'left',
                  color: l.code === lang ? '#10B981' : '#D1D5DB',
                  fontFamily: "'DM Sans',sans-serif", fontSize: 13,
                  fontWeight: l.code === lang ? 700 : 400,
                }}
              >
                <span style={{ width: 22, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{l.label}</span>
                <span>{l.name}</span>
                {l.code === lang && <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
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
  const [lang,      setLang]      = useState('en');

  // Persist language choice
  useEffect(() => {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem('eot_lang');
    if (saved && T[saved]) setLang(saved);
  }, []);
  useEffect(() => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('eot_lang', lang);
  }, [lang]);

  const t = T[lang] || T.en;

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
        body{background:#0B0F19;color:#F9FAFB;font-family:'DM Sans',sans-serif;min-height:100vh;padding-bottom:120px;-webkit-font-smoothing:antialiased;}
        @keyframes ping{75%,100%{transform:scale(2);opacity:0;}}
        @keyframes cardIn{from{opacity:0;transform:translateY(24px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
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
                {t.orderTracking}
              </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <LangPicker lang={lang} setLang={setLang} />

              <button
                onClick={() => fetchOrders(true)}
                disabled={refreshing}
                style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'6px 12px', background:'#0D1117',
                  border:'1px solid #1F2937', borderRadius:999,
                  cursor: refreshing ? 'default' : 'pointer',
                  color:'inherit', fontFamily:"'DM Sans',sans-serif",
                }}
              >
                {refreshing
                  ? <span style={{ fontSize:11, display:'inline-block', animation:'spin 0.8s linear infinite' }}>🔄</span>
                  : <LiveDot />
                }
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:1 }}>
                  <span style={{ fontSize:11, color:'#FFFFFF', lineHeight:1 }}>
                    {refreshing ? t.updating : (syncTime || '–– : ––')}
                  </span>
                  {!refreshing && (
                    <span style={{ fontSize:9, color:'#FFFFFF', lineHeight:1 }}>{t.tapToRefresh}</span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:560, margin:'0 auto', padding:'0 16px', position:'relative', zIndex:1 }}>

        {/* ── Search ── */}
        {config?.showSearch !== false && (
          <div style={{ position:'sticky', top:57, zIndex:50, paddingTop:12, paddingBottom:10, background:'#0B0F19' }}>
            <div style={{ position:'relative' }}>
              <span style={{
                position:'absolute', left:16, top:'50%', transform:'translateY(-50%)',
                fontSize:16, color:'#6B7280', pointerEvents:'none',
              }}>🔍</span>
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
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
              <div key={i} className="skeleton" style={{ height:120, opacity: 1 - i * 0.2 }} />
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

        {/* ── Section label ── */}
        {!loading && (
          <div style={{
            display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:12, marginTop:8,
          }}>
            <span style={{ fontSize:11, color:'#FFFFFF', letterSpacing:'0.08em', fontWeight:600 }}>
              {search ? t.results(filtered.length) : t.liveOrders}
            </span>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'64px 0', animation:'fadeIn 0.4s ease' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>{search ? '🔍' : '📦'}</div>
            <div style={{ fontSize:18, color:'#FFFFFF', fontWeight:600 }}>
              {search ? t.noResultsFor(search) : t.noOrders}
            </div>
            <div style={{ fontSize:14, color:'#6B7280', marginTop:8 }}>
              {search ? t.tryDifferent : t.checkBackSoon}
            </div>
          </div>
        )}

        {/* ── Cards ── */}
        {!loading && filtered.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {filtered.map((order, i) => (
              <OrderCard
                key={order.orderId || i}
                order={order}
                index={i}
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

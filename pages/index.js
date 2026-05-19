import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [code, setCode] = useState('');

  const handleGo = () => {
    const c = code.trim();
    if (c) window.location.href = '/' + c;
  };

  return (
    <>
      <Head>
        <title>EasyOrderTracking — Real-time order tracking for small businesses</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#030712" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#030712;color:#F9FAFB;font-family:'DM Sans',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased;}
        input{border:none;outline:none;}
        input::placeholder{color:#6B7280;}
      `}</style>

      <div style={{
        minHeight:'100vh', display:'flex', alignItems:'center',
        justifyContent:'center', padding:24,
      }}>
        <div style={{ maxWidth:440, width:'100%', textAlign:'center' }}>
          <div style={{ fontSize:52, marginBottom:20 }}>📦</div>

          <h1 style={{
            fontSize:38, fontWeight:800, letterSpacing:'-1.5px',
            fontFamily:"'Syne',sans-serif",
            background:'linear-gradient(135deg, #F9FAFB 0%, #9CA3AF 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            marginBottom:12, lineHeight:1.1,
          }}>
            EasyOrder<br />Tracking
          </h1>

          <p style={{ color:'#6B7280', fontSize:15, lineHeight:1.6, marginBottom:40 }}>
            Real-time order tracking for small businesses.<br />
            Powered by Google Sheets.
          </p>

          {/* Code lookup */}
          <div style={{
            background:'#0D1117', border:'1px solid #1F2937',
            borderRadius:20, padding:24,
          }}>
            <p style={{ fontSize:13, color:'#9CA3AF', marginBottom:14 }}>
              Have a tracking code? Enter it below.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && handleGo()}
                placeholder="e.g. 728192"
                maxLength={6}
                style={{
                  flex:1, padding:'12px 16px',
                  background:'#1F2937', border:'1px solid #374151',
                  borderRadius:12, color:'#F9FAFB', fontSize:18,
                  fontFamily:"'Syne',sans-serif", fontWeight:700,
                  letterSpacing:'0.15em', textAlign:'center',
                }}
              />
              <button onClick={handleGo} style={{
                padding:'12px 20px', background:'#1D4ED8',
                color:'#fff', border:'none', borderRadius:12,
                fontSize:14, fontWeight:600, cursor:'pointer',
                fontFamily:"'DM Sans',sans-serif",
              }}>Go →</button>
            </div>
          </div>

          <p style={{ fontSize:11, color:'#374151', marginTop:32 }}>
            © EasyOrderTracking — Built for small businesses
          </p>
        </div>
      </div>
    </>
  );
}

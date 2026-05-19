import Head from 'next/head';

export default function Custom404() {
  return (
    <>
      <Head><title>Tracking page not found</title></Head>
      <style>{`*{margin:0;padding:0;box-sizing:border-box;}body{background:#030712;color:#F9FAFB;font-family:'DM Sans',system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;}`}</style>
      <div>
        <div style={{ fontSize:52, marginBottom:16 }}>🔍</div>
        <h1 style={{ fontSize:22, fontWeight:700, marginBottom:10 }}>Tracking page not found</h1>
        <p style={{ color:'#6B7280', fontSize:14, maxWidth:300, lineHeight:1.6 }}>
          This code doesn't exist or the business may no longer be active. Check the URL and try again.
        </p>
      </div>
    </>
  );
}

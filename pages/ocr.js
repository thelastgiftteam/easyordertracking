import { useState, useRef, useCallback } from 'react';
import Head from 'next/head';

const CSM_USER = 'csmstebin';
const CSM_PASS = '11421';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (username.trim() === CSM_USER && password === CSM_PASS) {
        onLogin();
      } else {
        setError('Invalid username or password.');
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#030712',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: 24,
    }}>
      <div style={{ maxWidth: 380, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
          <div style={{
            fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif",
            letterSpacing: '-0.5px', color: '#F9FAFB',
          }}>CSM OCR Tool</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>
            EasyOrderTracking · Internal
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: '#0D1117', border: '1px solid #1F2937',
          borderRadius: 20, padding: '32px 28px',
        }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.06em' }}>
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
              style={{
                display: 'block', width: '100%', marginTop: 8,
                padding: '12px 16px', background: '#111827',
                border: '1px solid #1F2937', borderRadius: 12,
                color: '#F9FAFB', fontSize: 15, fontFamily: "'DM Sans', sans-serif",
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e  => e.target.style.borderColor = '#10B98180'}
              onBlur={e   => e.target.style.borderColor = '#1F2937'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.06em' }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{
                display: 'block', width: '100%', marginTop: 8,
                padding: '12px 16px', background: '#111827',
                border: '1px solid #1F2937', borderRadius: 12,
                color: '#F9FAFB', fontSize: 15, fontFamily: "'DM Sans', sans-serif",
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e  => e.target.style.borderColor = '#10B98180'}
              onBlur={e   => e.target.style.borderColor = '#1F2937'}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', marginBottom: 18, borderRadius: 10,
              background: '#1C0A0A', border: '1px solid #7F1D1D40',
              color: '#FCA5A5', fontSize: 13,
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: 12, border: 'none',
              background: loading ? '#374151' : 'linear-gradient(135deg, #059669, #10B981)',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#374151', marginTop: 20 }}>
          Powered by EasyOrderTracking
        </p>
      </div>
    </div>
  );
}

function SlipCard({ slip, index, onUpdate, onRemove }) {
  const { preview, status, result, error } = slip;

  function field(key, label, placeholder) {
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em', marginBottom: 4 }}>
          {label}
        </div>
        <input
          type="text"
          value={result?.[key] || ''}
          onChange={e => onUpdate(index, key, e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '9px 12px',
            background: result?.[key] ? '#111827' : '#0D1117',
            border: `1px solid ${result?.[key] ? '#1F2937' : '#374151'}`,
            borderRadius: 10, color: result?.[key] ? '#F9FAFB' : '#4B5563',
            fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e  => e.target.style.borderColor = '#10B98160'}
          onBlur={e   => e.target.style.borderColor = result?.[key] ? '#1F2937' : '#374151'}
        />
      </div>
    );
  }

  return (
    <div style={{
      background: '#0D1117',
      border: `1px solid ${status === 'done' ? '#065F46' : status === 'error' ? '#7F1D1D' : '#1F2937'}`,
      borderRadius: 18, padding: '16px', position: 'relative',
      animation: 'cardIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '18px 18px 0 0',
        background: status === 'done'  ? 'linear-gradient(90deg,#10B98160,transparent)' :
                    status === 'error' ? 'linear-gradient(90deg,#EF444460,transparent)' :
                                        'linear-gradient(90deg,#F59E0B60,transparent)',
      }} />

      <button
        onClick={() => onRemove(index)}
        style={{
          position: 'absolute', top: 12, right: 12,
          background: '#1F2937', border: 'none', color: '#9CA3AF',
          width: 26, height: 26, borderRadius: '50%', cursor: 'pointer',
          fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >✕</button>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 10, overflow: 'hidden',
          background: '#111827', flexShrink: 0, border: '1px solid #1F2937',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={`Slip ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
              color: status === 'done' ? '#10B981' : status === 'error' ? '#EF4444' : '#F59E0B',
            }}>
              {status === 'processing' ? '⏳ READING…' :
               status === 'done'       ? '✓ EXTRACTED' :
               status === 'error'      ? '✗ FAILED'    : '⏸ PENDING'}
            </span>
            <span style={{ fontSize: 11, color: '#4B5563' }}>Slip {index + 1}</span>
          </div>

          {status === 'error' && (
            <div style={{ fontSize: 12, color: '#FCA5A5', marginBottom: 10 }}>
              {error || 'Could not read this slip. Edit manually below.'}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {field('name',       'RECIPIENT NAME', 'e.g. Rahul Sharma')}
            {field('pincode',    'PINCODE',        '6-digit PIN')}
            {field('trackingId', 'TRACKING ID',    'AWB / Consignment')}
          </div>
        </div>
      </div>
    </div>
  );
}

function OCRPage() {
  const [slips,    setSlips]    = useState([]);
  const [dragging, setDragging] = useState(false);
  const [copied,   setCopied]   = useState(false);
  const fileRef = useRef();

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload  = () => resolve(r.result.split(',')[1]);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  async function processFiles(files) {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) return;

    const newSlips = imageFiles.map(f => ({
      id:       Math.random().toString(36).slice(2),
      preview:  URL.createObjectURL(f),
      mimeType: f.type,
      file:     f,
      status:   'pending',
      result:   { name: '', pincode: '', trackingId: '' },
      error:    null,
    }));

    setSlips(prev => [...prev, ...newSlips]);

    for (const slip of newSlips) {
      setSlips(prev => prev.map(s => s.id === slip.id ? { ...s, status: 'processing' } : s));

      try {
        const base64 = await toBase64(slip.file);
        const res    = await fetch('/api/extract', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ image: base64, mimeType: slip.mimeType }),
        });
        const data = await res.json();

        if (data.success) {
          setSlips(prev => prev.map(s =>
            s.id === slip.id ? { ...s, status: 'done', result: data.result } : s,
          ));
        } else {
          const msg = [data.error, data.detail].filter(Boolean).join(' | ');
          setSlips(prev => prev.map(s =>
            s.id === slip.id ? { ...s, status: 'error', error: msg } : s,
          ));
        }
      } catch {
        setSlips(prev => prev.map(s =>
          s.id === slip.id ? { ...s, status: 'error', error: 'Network error' } : s,
        ));
      }
    }
  }

  const onDrop = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField(index, key, value) {
    setSlips(prev => prev.map((s, i) =>
      i === index ? { ...s, result: { ...s.result, [key]: value } } : s,
    ));
  }

  function removeSlip(index) {
    setSlips(prev => prev.filter((_, i) => i !== index));
  }

  function buildTable() {
    const header = 'Name\tPincode\tTracking ID';
    const rows   = slips
      .filter(s => s.result?.name || s.result?.trackingId)
      .map(s => `${s.result.name}\t${s.result.pincode}\t${s.result.trackingId}`)
      .join('\n');
    return `${header}\n${rows}`;
  }

  function copyTable() {
    navigator.clipboard.writeText(buildTable()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const doneCount = slips.filter(s => s.status === 'done').length;
  const hasData   = slips.some(s => s.result?.name || s.result?.trackingId);

  return (
    <div style={{ minHeight: '100vh', background: '#030712', fontFamily: "'DM Sans', sans-serif", paddingBottom: 80 }}>
      <header style={{
        background: 'rgba(3,7,18,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #0D1117', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '14px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Syne', sans-serif",
              letterSpacing: '-0.4px', color: '#F9FAFB' }}>OCR Slip Reader</div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>EasyOrderTracking · CSM Tool</div>
          </div>
          {slips.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>{doneCount}/{slips.length} read</span>
              <button
                onClick={() => setSlips([])}
                style={{
                  padding: '6px 14px', borderRadius: 999, border: '1px solid #1F2937',
                  background: 'none', color: '#9CA3AF', fontSize: 12, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >Clear all</button>
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px' }}>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${dragging ? '#10B981' : '#1F2937'}`,
            borderRadius: 20, padding: '40px 24px', textAlign: 'center',
            cursor: 'pointer', background: dragging ? '#022c22' : '#0D1117',
            transition: 'all 0.2s', marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#F9FAFB', marginBottom: 6 }}>
            Drop tracking slip photos here
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
            or click to select — JPG, PNG, WEBP
          </div>
          <div style={{
            display: 'inline-block', padding: '10px 24px', borderRadius: 999,
            background: 'linear-gradient(135deg,#059669,#10B981)',
            color: '#fff', fontSize: 13, fontWeight: 700,
          }}>Upload Slips</div>
          <input
            ref={fileRef} type="file" accept="image/*" multiple
            style={{ display: 'none' }}
            onChange={e => { processFiles(e.target.files); e.target.value = ''; }}
          />
        </div>

        {slips.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {slips.map((slip, i) => (
              <SlipCard key={slip.id} slip={slip} index={i} onUpdate={updateField} onRemove={removeSlip} />
            ))}
          </div>
        )}

        {hasData && (
          <div style={{ background: '#0D1117', border: '1px solid #1F2937', borderRadius: 18, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F9FAFB' }}>Ready to paste into Google Sheets</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>Click copy → open your Sheet → paste (Ctrl+V)</div>
              </div>
              <button
                onClick={copyTable}
                style={{
                  padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: copied ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s', flexShrink: 0,
                }}
              >{copied ? '✓ Copied!' : '📋 Copy Table'}</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Name', 'Pincode', 'Tracking ID'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #1F2937',
                        fontSize: 10, fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slips.filter(s => s.result?.name || s.result?.trackingId).map(slip => (
                    <tr key={slip.id} style={{ borderBottom: '1px solid #111827' }}>
                      <td style={{ padding: '9px 12px', color: slip.result.name ? '#F9FAFB' : '#4B5563' }}>
                        {slip.result.name || '—'}
                      </td>
                      <td style={{ padding: '9px 12px', color: slip.result.pincode ? '#F9FAFB' : '#4B5563', fontFamily: 'monospace' }}>
                        {slip.result.pincode || '—'}
                      </td>
                      <td style={{ padding: '9px 12px', color: slip.result.trackingId ? '#10B981' : '#4B5563', fontFamily: 'monospace' }}>
                        {slip.result.trackingId || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {slips.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.8 }}>
              Upload photos of courier slips (DTDC, India Post, Delhivery…)<br />
              Gemini AI extracts <strong style={{ color: '#6B7280' }}>name · pincode · tracking ID</strong> automatically.<br />
              Review, edit if needed, then copy the table into Google Sheets.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function OCRRoute() {
  const [authed, setAuthed] = useState(false);

  return (
    <>
      <Head>
        <title>CSM OCR Tool · EasyOrderTracking</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { -webkit-font-smoothing: antialiased; }
        input { outline: none; }
        button { font-family: 'DM Sans', sans-serif; }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {authed ? <OCRPage /> : <LoginPage onLogin={() => setAuthed(true)} />}
    </>
  );
}

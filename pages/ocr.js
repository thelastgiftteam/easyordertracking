import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

const CSM_USERNAME = 'csmstebin';
const CSM_PASSWORD = '11421';
const CSM_SECRET   = 'flashtrack_csm';
const HQ_ENDPOINT  = '/api/hq-proxy';
const MAX_TABS     = 5;

const S = { IDLE:'idle', EXTRACTING:'extracting', DONE:'done', ERROR:'error' };

function emptyTab(id) {
  return { id, customer:null, rows:[], status:S.IDLE, progress:{ done:0, total:0 }, error:'' };
}

// ═══════════════════════════════════════════════════════
export default function OCRPage() {
  const [authed,   setAuthed]   = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAuthed(sessionStorage.getItem('csm_auth') === 'ok');
      setChecking(false);
    }
  }, []);

  if (checking) return null;

  return (
    <>
      <Head>
        <title>FlashTrack CSM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#0B0F19;color:#F9FAFB;font-family:'DM Sans',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased;font-size:15px;}
        input,button,select,textarea{font-family:inherit;}
        input:focus,select:focus{outline:none;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#374151;border-radius:4px;}
      `}</style>
      {authed
        ? <Dashboard onLogout={() => { sessionStorage.removeItem('csm_auth'); setAuthed(false); }} />
        : <LoginScreen onSuccess={() => setAuthed(true)} />
      }
    </>
  );
}

// ═══════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════
function LoginScreen({ onSuccess }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (u.trim() === CSM_USERNAME && p === CSM_PASSWORD) {
        sessionStorage.setItem('csm_auth', 'ok');
        onSuccess();
      } else {
        setErr('Wrong username or password');
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:400, animation:'fadeIn 0.4s ease' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>⚡</div>
          <h1 style={{
            fontSize:30, fontWeight:800, fontFamily:"'Syne',sans-serif",
            background:'linear-gradient(135deg,#F9FAFB,#9CA3AF)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            letterSpacing:'-0.5px', marginBottom:6,
          }}>FlashTrack CSM</h1>
          <p style={{ fontSize:15, color:'#6B7280' }}>Sign in to access the dashboard</p>
        </div>
        <form onSubmit={submit} style={{ background:'#0D1117', border:'1px solid #1F2937', borderRadius:18, padding:28 }}>
          <label style={labelStyle}>USERNAME</label>
          <input type="text" value={u} onChange={e=>setU(e.target.value)} placeholder="csmstebin" style={inputStyle} />
          <label style={{ ...labelStyle, marginTop:16, display:'block' }}>PASSWORD</label>
          <input type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="••••••" style={inputStyle} />
          {err && (
            <div style={{ marginTop:14, padding:'10px 14px', background:'#1C0A0A', border:'1px solid #7F1D1D40', borderRadius:10, color:'#FCA5A5', fontSize:14 }}>
              ⚠️ {err}
            </div>
          )}
          <button type="submit" disabled={loading} style={{
            width:'100%', marginTop:20, padding:'14px 20px',
            background:'linear-gradient(135deg,#1a3a8f,#1D4ED8)',
            color:'#fff', fontSize:16, fontWeight:700,
            border:'none', borderRadius:12, cursor:loading?'default':'pointer',
            opacity:loading?0.7:1, transition:'opacity 0.2s',
          }}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CUSTOMER SHEET PANEL
// ═══════════════════════════════════════════════════════
function CustomerSheetPanel({ customers }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.code.includes(query)
  );

  return (
    <div style={{ borderTop:'1px solid #1F2937', padding:'10px 10px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width:'100%', padding:'9px 12px',
          background: open ? '#0D1117' : 'transparent',
          border: open ? '1px solid #1F2937' : '1px solid transparent',
          borderRadius:8, cursor:'pointer', textAlign:'left',
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}
      >
        <span style={{ fontSize:12, color:'#6B7280', fontWeight:700, letterSpacing:'0.04em' }}>
          📄 Customer Sheets
        </span>
        <span style={{ fontSize:11, color:'#4B5563' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop:8 }}>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
            style={{
              width:'100%', padding:'8px 10px',
              background:'#1F2937', border:'1px solid #374151',
              borderRadius:8, color:'#F9FAFB', fontSize:13,
              marginBottom:6,
            }}
          />
          <div style={{ maxHeight:180, overflowY:'auto', display:'flex', flexDirection:'column', gap:2 }}>
            {filtered.length === 0
              ? <div style={{ fontSize:13, color:'#4B5563', padding:'8px 10px' }}>No results</div>
              : filtered.map(c => (
                c.sheetUrl
                  ? <a key={c.code} href={c.sheetUrl} target="_blank" rel="noreferrer"
                      style={{
                        display:'block', padding:'9px 12px', borderRadius:8,
                        textDecoration:'none', background:'transparent',
                        fontSize:13, fontWeight:600, color:'#9CA3AF',
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                        transition:'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background='#1F2937'; e.currentTarget.style.color='#F9FAFB'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#9CA3AF'; }}
                    >
                      📊 {c.name}
                    </a>
                  : <span key={c.code} style={{ display:'block', padding:'9px 12px', fontSize:13, color:'#4B5563' }}>
                      {c.name}
                    </span>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════
function Dashboard({ onLogout }) {
  const [tabs,        setTabs]        = useState(() => Array.from({length:MAX_TABS}, (_,i) => emptyTab(i+1)));
  const [activeTab,   setActiveTab]   = useState(1);
  const [customers,   setCustomers]   = useState([]);
  const [loadingCust, setLoadingCust] = useState(true);

  useEffect(() => {
    fetch(`${HQ_ENDPOINT}?action=getCustomers&secret=${CSM_SECRET}`)
      .then(r => r.json())
      .then(d => { setCustomers(d.customers || []); setLoadingCust(false); })
      .catch(() => setLoadingCust(false));
  }, []);

  const updateTab = useCallback((id, patch) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }, []);

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* SIDEBAR */}
      <aside style={{
        width:220, flexShrink:0, background:'#080D14',
        borderRight:'1px solid #1F2937',
        display:'flex', flexDirection:'column',
        position:'sticky', top:0, height:'100vh',
      }}>
        {/* Logo */}
        <div style={{ padding:'22px 18px 16px', borderBottom:'1px solid #1F2937' }}>
          <div style={{
            fontSize:18, fontWeight:800, fontFamily:"'Syne',sans-serif",
            background:'linear-gradient(135deg,#F9FAFB,#9CA3AF)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>⚡ FlashTrack</div>
          <div style={{ fontSize:12, color:'#4B5563', marginTop:3 }}>CSM Dashboard</div>
        </div>

        {/* Tasks */}
        <div style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:4, overflowY:'auto' }}>
          <div style={{ fontSize:11, color:'#4B5563', fontWeight:700, letterSpacing:'0.06em', padding:'4px 8px', marginBottom:4 }}>TASKS</div>
          {tabs.map(tab => (
            <TabButton key={tab.id} tab={tab} active={activeTab===tab.id} onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>

        {/* Customer Sheets */}
        <CustomerSheetPanel customers={customers} />

        {/* Logout */}
        <div style={{ padding:'12px 10px', borderTop:'1px solid #1F2937' }}>
          <button onClick={onLogout} style={{
            width:'100%', padding:'10px 14px', background:'transparent',
            border:'1px solid #374151', borderRadius:8, color:'#6B7280',
            fontSize:13, cursor:'pointer', textAlign:'left',
          }}>← Logout</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex:1, padding:28, overflowY:'auto', animation:'fadeIn 0.3s ease' }}>
        {currentTab && (
          <TabContent tab={currentTab} customers={customers} loadingCust={loadingCust} updateTab={updateTab} />
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB BUTTON
// ═══════════════════════════════════════════════════════
function TabButton({ tab, active, onClick }) {
  const dot = (color, pulse) => (
    <span style={{ width:9, height:9, borderRadius:'50%', background:color, flexShrink:0,
      display:'inline-block', animation: pulse ? 'pulse 1s infinite' : 'none' }} />
  );
  const icon = {
    [S.IDLE]:       dot('#374151', false),
    [S.EXTRACTING]: dot('#F59E0B', true),
    [S.DONE]:       dot('#10B981', false),
    [S.ERROR]:      <span style={{ fontSize:12 }}>⚠️</span>,
  }[tab.status];

  const sublabel = {
    [S.IDLE]:       'Empty',
    [S.EXTRACTING]: `${tab.progress.done}/${tab.progress.total} extracting…`,
    [S.DONE]:       `${tab.rows.length} rows ready`,
    [S.ERROR]:      'Error',
  }[tab.status];

  return (
    <button onClick={onClick} style={{
      width:'100%', padding:'9px 12px', borderRadius:8,
      background:active?'#0D1117':'transparent',
      border:active?'1px solid #1F2937':'1px solid transparent',
      cursor:'pointer', textAlign:'left', transition:'all 0.15s',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
        {icon}
        <span style={{ fontSize:13, fontWeight:600, color:active?'#F9FAFB':'#9CA3AF',
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
          {tab.customer ? tab.customer.name : `Task ${tab.id}`}
        </span>
      </div>
      <div style={{ fontSize:11, color:'#4B5563', marginTop:3, paddingLeft:18 }}>{sublabel}</div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════
// CUSTOMER SEARCH
// ═══════════════════════════════════════════════════════
function CustomerSearch({ customers, selected, onSelect }) {
  const [query, setQuery] = useState('');
  const [open,  setOpen]  = useState(false);
  const ref = useRef();

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.code.includes(query)
  );

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          width:'100%', padding:'12px 14px',
          background:'#1F2937', border:`1px solid ${open?'#1D4ED8':'#374151'}`,
          borderRadius:10, color:selected?'#F9FAFB':'#6B7280',
          fontSize:15, fontWeight:600, cursor:'pointer',
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}
      >
        <span>{selected ? selected.name : '— Select a customer —'}</span>
        <span style={{ fontSize:12, color:'#6B7280' }}>{open?'▲':'▼'}</span>
      </div>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
          background:'#1F2937', border:'1px solid #374151', borderRadius:10,
          zIndex:100, overflow:'hidden', boxShadow:'0 8px 32px #00000080',
        }}>
          <div style={{ padding:'10px 12px', borderBottom:'1px solid #374151' }}>
            <input autoFocus type="text" value={query} onChange={e=>setQuery(e.target.value)}
              placeholder="Search customer..."
              style={{ width:'100%', padding:'9px 12px', background:'#111827',
                border:'1px solid #374151', borderRadius:8, color:'#F9FAFB', fontSize:14 }} />
          </div>
          <div style={{ maxHeight:220, overflowY:'auto' }}>
            {filtered.length === 0
              ? <div style={{ padding:'14px 16px', fontSize:14, color:'#6B7280' }}>No customers found</div>
              : filtered.map(c => (
                <div key={c.code}
                  onClick={() => { onSelect(c); setOpen(false); setQuery(''); }}
                  style={{ padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #37415130',
                    display:'flex', justifyContent:'space-between', alignItems:'center' }}
                  onMouseEnter={e => e.currentTarget.style.background='#374151'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <span style={{ fontSize:14, fontWeight:600, color:'#F9FAFB' }}>{c.name}</span>
                  <span style={{ fontSize:12, color:'#4B5563', fontFamily:'monospace' }}>{c.code}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB CONTENT
// ═══════════════════════════════════════════════════════
function TabContent({ tab, customers, loadingCust, updateTab }) {
  const fileInputRef  = useRef();
  const [copied,   setCopied]   = useState(false);
  const [dragging, setDragging] = useState(false);

  const setCustomer = (customer) => updateTab(tab.id, { customer, status:S.IDLE, rows:[], error:'' });
  const reset       = ()         => updateTab(tab.id, emptyTab(tab.id));
  const updateRow   = (id, f, v) => updateTab(tab.id, { rows: tab.rows.map(r => r.id===id ? {...r,[f]:v} : r) });
  const removeRow   = (id)       => updateTab(tab.id, { rows: tab.rows.filter(r => r.id!==id) });
  const addRow      = ()         => updateTab(tab.id, { rows: [...tab.rows, {id:Date.now(),name:'',pincode:'',trackingId:'',error:''}] });

  const copyAsTSV = async () => {
    const tsv = tab.rows
      .filter(r => r.name || r.trackingId)
      .map(r => `${r.name}\t${r.pincode}\t${r.trackingId}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { alert('Copy failed — select table manually'); }
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    if (!tab.customer) { alert('Please select a customer first'); return; }

    updateTab(tab.id, { status:S.EXTRACTING, progress:{ done:0, total:files.length }, rows:[], error:'' });

    const extracted = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const base64 = await fileToBase64(files[i]);
        const res    = await fetch('/api/extract', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ image:base64, mimeType:files[i].type }),
        });
        const data = await res.json();
        extracted.push({
          id: Date.now()+i,
          name:       data.result?.name       || '',
          pincode:    data.result?.pincode    || '',
          trackingId: data.result?.trackingId || '',
          error:      data.success ? '' : (data.error || 'Failed'),
        });
      } catch (err) {
        extracted.push({ id:Date.now()+i, name:'', pincode:'', trackingId:'', error:err.message });
      }
      updateTab(tab.id, { progress:{ done:i+1, total:files.length } });
    }

    updateTab(tab.id, { rows:extracted, status:S.DONE });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isDone       = tab.status === S.DONE;
  const isExtracting = tab.status === S.EXTRACTING;

  return (
    <div style={{ maxWidth:900, animation:'fadeIn 0.3s ease' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <h2 style={{
            fontSize:26, fontWeight:800, fontFamily:"'Syne',sans-serif",
            background:'linear-gradient(135deg,#F9FAFB,#9CA3AF)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            letterSpacing:'-0.4px',
          }}>Task {tab.id}</h2>
          <p style={{ fontSize:14, color:'#6B7280', marginTop:4 }}>
            Select customer → drop images → copy table → paste in sheet
          </p>
        </div>
        {isDone && (
          <button onClick={reset} style={btnSecondary}>↺ Reset</button>
        )}
      </div>

      {/* Customer selector */}
      <div style={{ background:'#0D1117', border:'1px solid #1F2937', borderRadius:14, padding:18, marginBottom:16 }}>
        <label style={{ ...labelStyle, display:'block', marginBottom:10 }}>CUSTOMER</label>
        {loadingCust
          ? <div style={{ fontSize:14, color:'#6B7280' }}>Loading customers…</div>
          : <CustomerSearch customers={customers} selected={tab.customer} onSelect={setCustomer} />
        }
      </div>

      {/* Drop zone */}
      <div
        onDragEnter={e => { e.preventDefault(); setDragging(true); }}
        onDragOver={e  => { e.preventDefault(); setDragging(true); }}
        onDragLeave={e => { e.preventDefault(); setDragging(false); }}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !isExtracting && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#10B981' : isExtracting ? '#F59E0B' : '#374151'}`,
          borderRadius:14,
          padding:'44px 24px',
          textAlign:'center',
          background: dragging ? '#022c22' : isExtracting ? '#0D1117' : '#080D14',
          cursor: isExtracting ? 'default' : 'pointer',
          marginBottom:16,
          transition:'all 0.2s',
          userSelect:'none',
        }}
      >
        <div style={{ fontSize:44, marginBottom:12, pointerEvents:'none' }}>
          {isExtracting
            ? <span style={{ display:'inline-block', animation:'spin 0.8s linear infinite' }}>⟳</span>
            : dragging ? '📂' : '📸'
          }
        </div>
        <div style={{ fontSize:17, fontWeight:700, color:'#F9FAFB', marginBottom:6, pointerEvents:'none' }}>
          {isExtracting
            ? `Extracting ${tab.progress.done} of ${tab.progress.total} images…`
            : dragging
              ? 'Drop to extract!'
              : 'Drop tracking slip images here'
          }
        </div>
        {!isExtracting && !dragging && (
          <div style={{ fontSize:14, color:'#6B7280', pointerEvents:'none' }}>
            or click to browse · PNG, JPG · multiple at once
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" multiple
          onChange={e => handleFiles(e.target.files)} style={{ display:'none' }} />
      </div>

      {/* Extracted table */}
      {tab.rows.length > 0 && (
        <div style={{ background:'#0D1117', border:'1px solid #1F2937', borderRadius:14, overflow:'hidden', marginBottom:16 }}>
          <div style={{
            padding:'14px 18px', borderBottom:'1px solid #1F2937',
            display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <span style={{ fontSize:13, color:'#9CA3AF', fontWeight:700, letterSpacing:'0.04em' }}>
              {tab.rows.length} ROWS · {tab.customer?.name || '—'}
            </span>
            {isDone && <span style={{ fontSize:13, color:'#10B981', fontWeight:600 }}>✓ Ready to copy</span>}
          </div>

          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
              <thead>
                <tr style={{ background:'#111827' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Customer Name</th>
                  <th style={thStyle}>Pincode</th>
                  <th style={thStyle}>Tracking ID</th>
                  <th style={{ ...thStyle, width:44 }}></th>
                </tr>
              </thead>
              <tbody>
                {tab.rows.map((row, i) => (
                  <tr key={row.id} style={{
                    background:row.error?'#1C0A0A':(i%2===0?'#0D1117':'#0F141C'),
                    borderTop:'1px solid #1F2937',
                  }}>
                    <td style={{ ...tdStyle, color:'#4B5563', fontSize:12, textAlign:'center', width:36 }}>{i+1}</td>
                    <td style={tdStyle}><CellInput value={row.name}       onChange={v=>updateRow(row.id,'name',v)} /></td>
                    <td style={tdStyle}><CellInput value={row.pincode}    onChange={v=>updateRow(row.id,'pincode',v)} mono /></td>
                    <td style={tdStyle}><CellInput value={row.trackingId} onChange={v=>updateRow(row.id,'trackingId',v)} mono /></td>
                    <td style={{ ...tdStyle, textAlign:'center' }}>
                      <button onClick={()=>removeRow(row.id)} style={{
                        background:'transparent', border:'none',
                        color:'#6B7280', cursor:'pointer', fontSize:18, padding:4,
                      }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding:14, borderTop:'1px solid #1F2937' }}>
            <button onClick={addRow} style={btnSecondary}>+ Add Row</button>
          </div>
        </div>
      )}

      {/* Copy + Open Sheet */}
      {isDone && tab.rows.length > 0 && tab.customer && (
        <div style={{
          background:'#0D1117', border:'1px solid #065F46',
          borderRadius:14, padding:18, display:'flex', flexDirection:'column', gap:10,
        }}>
          <div style={{ fontSize:14, color:'#9CA3AF' }}>
            {tab.rows.filter(r=>r.name||r.trackingId).length} rows ready for <strong style={{ color:'#F9FAFB' }}>{tab.customer.name}</strong>
          </div>

          <button onClick={copyAsTSV} style={{
            width:'100%', padding:'15px 20px',
            background: copied
              ? 'linear-gradient(135deg,#047857,#10B981)'
              : 'linear-gradient(135deg,#1a3a8f,#1D4ED8)',
            color:'#fff', fontSize:16, fontWeight:800,
            border:'none', borderRadius:12, cursor:'pointer',
            transition:'background 0.3s',
          }}>
            {copied ? '✅ Copied! Now paste in the sheet' : '📋 Copy Table'}
          </button>

          {tab.customer?.sheetUrl && (
            <a href={tab.customer.sheetUrl} target="_blank" rel="noreferrer"
              style={{
                display:'block', width:'100%', padding:'13px 20px',
                background:'transparent', border:'1px solid #374151',
                borderRadius:12, color:'#9CA3AF', fontSize:14, fontWeight:600,
                textDecoration:'none', textAlign:'center',
              }}
            >
              📄 Open {tab.customer.name} Sheet
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CELL INPUT
// ═══════════════════════════════════════════════════════
function CellInput({ value, onChange, mono }) {
  return (
    <input
      value={value||''} onChange={e=>onChange(e.target.value)}
      style={{
        width:'100%', padding:'8px 10px',
        background:'transparent', border:'1px solid transparent',
        borderRadius:6, color:'#F9FAFB',
        fontSize:14, fontFamily:mono?'monospace':"'DM Sans',sans-serif",
        fontWeight:mono?700:500, letterSpacing:mono?'0.3px':'0',
        transition:'all 0.15s',
      }}
      onFocus={e => { e.target.style.background='#1F2937'; e.target.style.borderColor='#1D4ED8'; }}
      onBlur={e  => { e.target.style.background='transparent'; e.target.style.borderColor='transparent'; }}
    />
  );
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const labelStyle   = { fontSize:12, color:'#9CA3AF', fontWeight:700, letterSpacing:'0.06em' };
const inputStyle   = { width:'100%', marginTop:8, padding:'12px 14px', background:'#1F2937', border:'1px solid #374151', borderRadius:10, color:'#F9FAFB', fontSize:15 };
const thStyle      = { padding:'11px 14px', textAlign:'left', fontSize:12, fontWeight:700, color:'#9CA3AF', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid #1F2937' };
const tdStyle      = { padding:'4px 8px', verticalAlign:'middle' };
const btnSecondary = { padding:'10px 16px', background:'#1F2937', color:'#D1D5DB', border:'1px solid #374151', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' };

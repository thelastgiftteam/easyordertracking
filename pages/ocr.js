import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

const CSM_USERNAME = 'csmstebin';
const CSM_PASSWORD = '11421';
const CSM_SECRET   = 'flashtrack_csm';
const HQ_ENDPOINT  = process.env.NEXT_PUBLIC_HQ_ENDPOINT || '';

const MAX_TABS = 5;

// ═══════════════════════════════════════════════════════════════
// TAB STATUS
const S = { IDLE: 'idle', EXTRACTING: 'extracting', DONE: 'done', PUSHING: 'pushing', PUSHED: 'pushed', ERROR: 'error' };

function emptyTab(id) {
  return { id, customer: null, rows: [], status: S.IDLE, progress: { done: 0, total: 0 }, error: '' };
}

// ═══════════════════════════════════════════════════════════════
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
        body{background:#0B0F19;color:#F9FAFB;font-family:'DM Sans',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased;}
        input,button,select,textarea{font-family:inherit;}
        input:focus,select:focus{outline:none;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#1F2937;border-radius:4px;}
      `}</style>
      {authed
        ? <Dashboard onLogout={() => { sessionStorage.removeItem('csm_auth'); setAuthed(false); }} />
        : <LoginScreen onSuccess={() => setAuthed(true)} />
      }
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════
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
      <div style={{ width:'100%', maxWidth:360, animation:'fadeIn 0.4s ease' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:42, marginBottom:10 }}>⚡</div>
          <h1 style={{
            fontSize:26, fontWeight:800, fontFamily:"'Syne',sans-serif",
            background:'linear-gradient(135deg,#F9FAFB,#9CA3AF)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            letterSpacing:'-0.5px', marginBottom:4,
          }}>FlashTrack CSM</h1>
          <p style={{ fontSize:12, color:'#6B7280' }}>Sign in to access the dashboard</p>
        </div>
        <form onSubmit={submit} style={{ background:'#0D1117', border:'1px solid #1F2937', borderRadius:16, padding:24 }}>
          <label style={labelStyle}>USERNAME</label>
          <input type="text" value={u} onChange={e=>setU(e.target.value)} placeholder="csmstebin" style={inputStyle} />
          <label style={{ ...labelStyle, marginTop:14, display:'block' }}>PASSWORD</label>
          <input type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="••••••" style={inputStyle} />
          {err && <div style={{ marginTop:12, padding:'8px 12px', background:'#1C0A0A', border:'1px solid #7F1D1D40', borderRadius:8, color:'#FCA5A5', fontSize:12 }}>⚠️ {err}</div>}
          <button type="submit" disabled={loading} style={{
            width:'100%', marginTop:18, padding:'12px 20px',
            background:'linear-gradient(135deg,#1a3a8f,#1D4ED8)',
            color:'#fff', fontSize:14, fontWeight:700,
            border:'none', borderRadius:12, cursor: loading?'default':'pointer',
            opacity: loading?0.7:1, transition:'opacity 0.2s',
          }}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function Dashboard({ onLogout }) {
  const [tabs,        setTabs]        = useState(() => Array.from({length:MAX_TABS}, (_,i) => emptyTab(i+1)));
  const [activeTab,   setActiveTab]   = useState(1);
  const [customers,   setCustomers]   = useState([]);
  const [loadingCust, setLoadingCust] = useState(true);

  // Load customer list on mount
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

      {/* ── LEFT SIDEBAR ── */}
      <aside style={{
        width:200, flexShrink:0, background:'#080D14',
        borderRight:'1px solid #1F2937',
        display:'flex', flexDirection:'column',
        position:'sticky', top:0, height:'100vh',
      }}>
        {/* Logo */}
        <div style={{ padding:'20px 16px 14px', borderBottom:'1px solid #1F2937' }}>
          <div style={{
            fontSize:16, fontWeight:800, fontFamily:"'Syne',sans-serif",
            background:'linear-gradient(135deg,#F9FAFB,#9CA3AF)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            letterSpacing:'-0.3px',
          }}>⚡ FlashTrack</div>
          <div style={{ fontSize:10, color:'#4B5563', marginTop:2 }}>CSM Dashboard</div>
        </div>

        {/* Tab list */}
        <div style={{ flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ fontSize:9, color:'#4B5563', fontWeight:700, letterSpacing:'0.08em', padding:'4px 8px', marginBottom:2 }}>TASKS</div>
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Logout */}
        <div style={{ padding:'12px 8px', borderTop:'1px solid #1F2937' }}>
          <button onClick={onLogout} style={{
            width:'100%', padding:'8px 12px',
            background:'transparent', border:'1px solid #374151',
            borderRadius:8, color:'#6B7280', fontSize:11,
            cursor:'pointer', textAlign:'left',
          }}>← Logout</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex:1, padding:24, overflowY:'auto', animation:'fadeIn 0.3s ease' }}>
        {currentTab && (
          <TabContent
            tab={currentTab}
            customers={customers}
            loadingCust={loadingCust}
            updateTab={updateTab}
          />
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB BUTTON (sidebar)
// ═══════════════════════════════════════════════════════════════
function TabButton({ tab, active, onClick }) {
  const statusIcon = {
    [S.IDLE]:       <span style={{ width:8,height:8,borderRadius:'50%',background:'#374151',display:'inline-block' }} />,
    [S.EXTRACTING]: <span style={{ width:8,height:8,borderRadius:'50%',background:'#F59E0B',display:'inline-block',animation:'pulse 1s infinite' }} />,
    [S.DONE]:       <span style={{ width:8,height:8,borderRadius:'50%',background:'#10B981',display:'inline-block' }} />,
    [S.PUSHING]:    <span style={{ width:8,height:8,borderRadius:'50%',background:'#60A5FA',display:'inline-block',animation:'pulse 1s infinite' }} />,
    [S.PUSHED]:     <span style={{ fontSize:10 }}>✅</span>,
    [S.ERROR]:      <span style={{ fontSize:10 }}>⚠️</span>,
  }[tab.status];

  const label = tab.customer ? tab.customer.name : `Task ${tab.id}`;
  const sublabel = {
    [S.IDLE]:       'Empty',
    [S.EXTRACTING]: `${tab.progress.done}/${tab.progress.total} extracting…`,
    [S.DONE]:       `${tab.rows.length} rows ready`,
    [S.PUSHING]:    'Pushing…',
    [S.PUSHED]:     'Pushed ✓',
    [S.ERROR]:      'Error',
  }[tab.status];

  return (
    <button onClick={onClick} style={{
      width:'100%', padding:'8px 10px', borderRadius:8,
      background: active ? '#0D1117' : 'transparent',
      border: active ? '1px solid #1F2937' : '1px solid transparent',
      cursor:'pointer', textAlign:'left', transition:'all 0.15s',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {statusIcon}
        <span style={{ fontSize:12, fontWeight:600, color: active?'#F9FAFB':'#9CA3AF',
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize:10, color:'#4B5563', marginTop:2, paddingLeft:16 }}>{sublabel}</div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB CONTENT
// ═══════════════════════════════════════════════════════════════
function TabContent({ tab, customers, loadingCust, updateTab }) {
  const fileInputRef = useRef();
  const [pushError,  setPushError]  = useState('');
  const [pushMsg,    setPushMsg]    = useState('');

  const setCustomer = (customer) => updateTab(tab.id, { customer, status: S.IDLE, rows:[], error:'' });

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    if (!tab.customer) { alert('Please select a customer first'); return; }

    updateTab(tab.id, { status: S.EXTRACTING, progress:{ done:0, total:files.length }, rows:[], error:'' });

    const extracted = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const base64 = await fileToBase64(files[i]);
        const res    = await fetch('/api/extract', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ image: base64, mimeType: files[i].type }),
        });
        const data = await res.json();
        extracted.push({
          id:         Date.now() + i,
          name:       data.result?.name       || '',
          pincode:    data.result?.pincode    || '',
          trackingId: data.result?.trackingId || '',
          error:      data.success ? '' : (data.error || 'Failed'),
        });
      } catch (err) {
        extracted.push({ id: Date.now()+i, name:'', pincode:'', trackingId:'', error: err.message });
      }
      updateTab(tab.id, { progress:{ done: i+1, total: files.length } });
    }

    updateTab(tab.id, { rows: extracted, status: S.DONE });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateRow  = (id, field, val) => updateTab(tab.id, { rows: tab.rows.map(r => r.id===id ? {...r,[field]:val} : r) });
  const removeRow  = (id)            => updateTab(tab.id, { rows: tab.rows.filter(r => r.id!==id) });
  const addRow     = ()              => updateTab(tab.id, { rows: [...tab.rows, {id:Date.now(),name:'',pincode:'',trackingId:'',error:''}] });
  const reset      = ()              => updateTab(tab.id, emptyTab(tab.id));

  const pushToSheet = async () => {
    if (!tab.customer) return;
    if (tab.rows.length === 0) return;

    setPushError('');
    setPushMsg('');
    updateTab(tab.id, { status: S.PUSHING });

    try {
      const res = await fetch(HQ_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          action: 'pushRows',
          secret: CSM_SECRET,
          code:   tab.customer.code,
          rows:   tab.rows.filter(r => r.name || r.trackingId),
        }),
      });
      const data = await res.json();
      if (data.success) {
        updateTab(tab.id, { status: S.PUSHED });
        setPushMsg(`✅ ${data.pushed} rows pushed to ${tab.customer.name}`);
      } else {
        updateTab(tab.id, { status: S.ERROR, error: data.error || 'Push failed' });
        setPushError(data.error || 'Push failed');
      }
    } catch (err) {
      updateTab(tab.id, { status: S.ERROR, error: err.message });
      setPushError(err.message);
    }
  };

  const isDone    = tab.status === S.DONE;
  const isPushed  = tab.status === S.PUSHED;
  const isExtracting = tab.status === S.EXTRACTING;

  return (
    <div style={{ maxWidth:860, animation:'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h2 style={{
            fontSize:22, fontWeight:800, fontFamily:"'Syne',sans-serif",
            background:'linear-gradient(135deg,#F9FAFB,#9CA3AF)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            letterSpacing:'-0.4px',
          }}>Task {tab.id}</h2>
          <p style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>
            {isPushed ? 'Done! Start a new task or close.' : 'Select customer → drop images → confirm → push'}
          </p>
        </div>
        {(isDone || isPushed) && (
          <button onClick={reset} style={btnSecondary}>↺ Reset</button>
        )}
      </div>

      {/* Customer dropdown */}
      <div style={{
        background:'#0D1117', border:'1px solid #1F2937',
        borderRadius:14, padding:16, marginBottom:16,
      }}>
        <label style={{ ...labelStyle, display:'block', marginBottom:8 }}>CUSTOMER</label>
        {loadingCust ? (
          <div style={{ fontSize:13, color:'#6B7280' }}>Loading customers…</div>
        ) : (
          <select
            value={tab.customer?.code || ''}
            onChange={e => {
              const c = customers.find(c => c.code === e.target.value);
              setCustomer(c || null);
            }}
            style={{
              width:'100%', padding:'10px 12px',
              background:'#1F2937', border:'1px solid #374151',
              borderRadius:10, color: tab.customer ? '#F9FAFB' : '#6B7280',
              fontSize:14, fontWeight:600, cursor:'pointer',
            }}
          >
            <option value="">— Select a customer —</option>
            {customers.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Drop zone */}
      {!isPushed && (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          onClick={() => !isExtracting && fileInputRef.current?.click()}
          style={{
            border:`2px dashed ${isExtracting ? '#F59E0B' : '#374151'}`,
            borderRadius:14, padding:'32px 20px', textAlign:'center',
            background: isExtracting ? '#0D1117' : '#080D14',
            cursor: isExtracting ? 'default' : 'pointer',
            marginBottom:16, transition:'all 0.2s',
          }}
        >
          <div style={{ fontSize:32, marginBottom:8 }}>
            {isExtracting
              ? <span style={{ display:'inline-block', animation:'spin 0.8s linear infinite' }}>⟳</span>
              : '📸'
            }
          </div>
          <div style={{ fontSize:14, fontWeight:600, color:'#F9FAFB', marginBottom:4 }}>
            {isExtracting
              ? `Extracting ${tab.progress.done} of ${tab.progress.total} images…`
              : 'Drop tracking slip images here'
            }
          </div>
          {!isExtracting && (
            <div style={{ fontSize:12, color:'#6B7280' }}>Click to browse · PNG or JPG · Multiple at once</div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" multiple
            onChange={e => handleFiles(e.target.files)} style={{ display:'none' }} />
        </div>
      )}

      {/* Extracted table */}
      {tab.rows.length > 0 && (
        <div style={{ background:'#0D1117', border:'1px solid #1F2937', borderRadius:14, overflow:'hidden', marginBottom:16 }}>
          <div style={{
            padding:'12px 16px', borderBottom:'1px solid #1F2937',
            display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <span style={{ fontSize:11, color:'#9CA3AF', fontWeight:700, letterSpacing:'0.06em' }}>
              {tab.rows.length} ROWS · {tab.customer?.name || '—'}
            </span>
            {isDone && <span style={{ fontSize:11, color:'#10B981', fontWeight:600 }}>✓ Ready to push</span>}
            {isPushed && <span style={{ fontSize:11, color:'#10B981', fontWeight:600 }}>✅ Pushed to sheet</span>}
          </div>

          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#111827' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Customer Name</th>
                  <th style={thStyle}>Pincode</th>
                  <th style={thStyle}>Tracking ID</th>
                  <th style={{ ...thStyle, width:40 }}></th>
                </tr>
              </thead>
              <tbody>
                {tab.rows.map((row, i) => (
                  <tr key={row.id} style={{
                    background: row.error ? '#1C0A0A' : (i%2===0 ? '#0D1117' : '#0F141C'),
                    borderTop:'1px solid #1F2937',
                    opacity: isPushed ? 0.6 : 1,
                  }}>
                    <td style={{ ...tdStyle, color:'#4B5563', fontSize:11, textAlign:'center', width:32 }}>{i+1}</td>
                    <td style={tdStyle}><CellInput value={row.name}       onChange={v=>updateRow(row.id,'name',v)}       disabled={isPushed} /></td>
                    <td style={tdStyle}><CellInput value={row.pincode}    onChange={v=>updateRow(row.id,'pincode',v)}    disabled={isPushed} mono /></td>
                    <td style={tdStyle}><CellInput value={row.trackingId} onChange={v=>updateRow(row.id,'trackingId',v)} disabled={isPushed} mono /></td>
                    <td style={{ ...tdStyle, textAlign:'center' }}>
                      {!isPushed && (
                        <button onClick={()=>removeRow(row.id)} style={{
                          background:'transparent', border:'none',
                          color:'#6B7280', cursor:'pointer', fontSize:16, padding:4,
                        }}>×</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isPushed && (
            <div style={{ padding:12, borderTop:'1px solid #1F2937', display:'flex', gap:8 }}>
              <button onClick={addRow} style={btnSecondary}>+ Add Row</button>
            </div>
          )}
        </div>
      )}

      {/* Errors */}
      {pushError && (
        <div style={{ padding:12, marginBottom:12, background:'#1C0A0A', border:'1px solid #7F1D1D40', borderRadius:10, color:'#FCA5A5', fontSize:12 }}>
          ⚠️ {pushError}
        </div>
      )}
      {pushMsg && (
        <div style={{ padding:12, marginBottom:12, background:'#022c22', border:'1px solid #05966940', borderRadius:10, color:'#6EE7B7', fontSize:12 }}>
          {pushMsg}
        </div>
      )}

      {/* CONFIRM + PUSH button */}
      {isDone && tab.rows.length > 0 && tab.customer && (
        <div style={{
          background:'#0D1117', border:'1px solid #065F46',
          borderRadius:14, padding:16,
        }}>
          <div style={{ fontSize:13, color:'#9CA3AF', marginBottom:12 }}>
            Confirm before pushing:
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:16 }}>
            <div style={{
              padding:'6px 14px', background:'#1F2937', borderRadius:8,
              fontSize:13, fontWeight:700, color:'#F9FAFB',
            }}>
              📦 {tab.customer.name}
            </div>
            <div style={{ fontSize:13, color:'#6B7280' }}>→</div>
            <div style={{
              padding:'6px 14px', background:'#052e16', border:'1px solid #05966940',
              borderRadius:8, fontSize:13, fontWeight:600, color:'#10B981',
            }}>
              {tab.rows.filter(r=>r.name||r.trackingId).length} rows will be added
            </div>
          </div>
          <button onClick={pushToSheet} style={{
            width:'100%', padding:'13px 20px',
            background:'linear-gradient(135deg,#047857,#10B981)',
            color:'#fff', fontSize:15, fontWeight:800,
            border:'none', borderRadius:12, cursor:'pointer',
            letterSpacing:'-0.2px',
          }}>
            ⚡ Push to {tab.customer.name} Sheet
          </button>
        </div>
      )}

      {isPushed && (
        <div style={{
          padding:'20px 16px', background:'linear-gradient(135deg,#022c22,#064E3B)',
          border:'1px solid #059669', borderRadius:14, textAlign:'center',
        }}>
          <div style={{ fontSize:28, marginBottom:6 }}>🎉</div>
          <div style={{ fontSize:15, fontWeight:800, color:'#10B981', fontFamily:"'Syne',sans-serif" }}>
            {pushMsg || 'Pushed successfully!'}
          </div>
          <div style={{ fontSize:12, color:'#6EE7B7', marginTop:4 }}>
            Orders are now live on the tracking page.
          </div>
          <button onClick={reset} style={{ ...btnSecondary, marginTop:14 }}>
            Start Next Customer
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CELL INPUT
// ═══════════════════════════════════════════════════════════════
function CellInput({ value, onChange, mono, disabled }) {
  return (
    <input
      value={value||''} onChange={e=>onChange(e.target.value)}
      disabled={disabled}
      style={{
        width:'100%', padding:'6px 8px',
        background:'transparent', border:'1px solid transparent',
        borderRadius:6, color: disabled ? '#6B7280' : '#F9FAFB',
        fontSize:13, fontFamily: mono ? 'monospace' : "'DM Sans',sans-serif",
        fontWeight: mono ? 700 : 500,
        letterSpacing: mono ? '0.3px' : '0',
        transition:'all 0.15s', cursor: disabled ? 'default' : 'text',
      }}
      onFocus={e => { if(!disabled){ e.target.style.background='#1F2937'; e.target.style.borderColor='#1D4ED8'; }}}
      onBlur={e  => { e.target.style.background='transparent'; e.target.style.borderColor='transparent'; }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const labelStyle = { fontSize:10, color:'#9CA3AF', fontWeight:700, letterSpacing:'0.06em' };
const inputStyle = { width:'100%', marginTop:6, padding:'10px 12px', background:'#1F2937', border:'1px solid #374151', borderRadius:10, color:'#F9FAFB', fontSize:14 };
const thStyle    = { padding:'9px 12px', textAlign:'left', fontSize:10, fontWeight:700, color:'#9CA3AF', letterSpacing:'0.08em', textTransform:'uppercase', borderBottom:'1px solid #1F2937' };
const tdStyle    = { padding:'3px 8px', verticalAlign:'middle' };
const btnSecondary = { padding:'8px 14px', background:'#1F2937', color:'#D1D5DB', border:'1px solid #374151', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' };

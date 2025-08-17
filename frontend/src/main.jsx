import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { apiGet, apiPost, apiDel, downloadHistoryCSV } from './api';

// --- UI helpers ---
function Badge({ color = '#444', children }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:8,
      padding:'6px 10px', borderRadius:999, background:color, fontSize:12
    }}>{children}</span>
  );
}
function Card({ title, right, children }) {
  return (
    <section style={{
      background:'#121827', border:'1px solid #1f2937', borderRadius:14,
      padding:18, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.03)'
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
        <h3 style={{margin:0, fontSize:16, color:'#e5e7eb', fontWeight:600}}>{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}
function Field({ label, children, hint }) {
  return (
    <label style={{display:'grid', gap:6, marginBottom:12}}>
      <span style={{color:'#9ca3af', fontSize:13}}>{label}</span>
      {children}
      {hint && <small style={{color:'#6b7280'}}>{hint}</small>}
    </label>
  );
}
function Input(props) {
  return (
    <input {...props} style={{
      ...props.style,
      background:'#0b1220', color:'#e5e7eb', border:'1px solid #263244',
      borderRadius:10, padding:'10px 12px', outline:'none'
    }}/>
  );
}
function Textarea(props) {
  return (
    <textarea {...props} style={{
      ...props.style,
      background:'#0b1220', color:'#e5e7eb', border:'1px solid #263244',
      borderRadius:10, padding:'10px 12px', outline:'none',
      minHeight:120, resize:'vertical'
    }}/>
  );
}
function Select(props) {
  return (
    <select {...props} style={{
      ...props.style,
      background:'#0b1220', color:'#e5e7eb', border:'1px solid #263244',
      borderRadius:10, padding:'10px 12px', outline:'none'
    }}/>
  );
}
function Button({ variant='primary', ...props }) {
  const styles = {
    primary: { background:'#2563eb', color:'#fff', border:'1px solid #1e40af' },
    ghost:   { background:'transparent', color:'#e5e7eb', border:'1px solid #263244' },
    danger:  { background:'#b91c1c', color:'#fff', border:'1px solid #7f1d1d' }
  }[variant];
  return (
    <button {...props} style={{
      ...styles, borderRadius:10, padding:'10px 14px',
      cursor:'pointer', fontWeight:600
    }}/>
  );
}

// --- TopBar ---
function TopBar({ apiOnline, view, setView }) {
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
      <h1 style={{margin:0, color:'#e5e7eb', fontSize:22, display:'flex', alignItems:'center', gap:10}}>
        <span role="img" aria-label="bell">🔔</span> Central de Campanhas
      </h1>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <Badge color={apiOnline ? '#166534' : '#7f1d1d'}>
          {apiOnline ? 'API online ✅' : 'API offline ⚠️'}
        </Badge>
        <Button variant={view==='create'?'primary':'ghost'} onClick={()=>setView('create')}>Criar</Button>
        <Button variant={view==='history'?'primary':'ghost'} onClick={()=>setView('history')}>Histórico</Button>
      </div>
    </div>
  );
}

// --- Formulário de criação ---
function CreateCampaignForm({ onCreated }) {
  const [message, setMessage] = useState('');
  const [vendor, setVendor] = useState('');
  const [tag, setTag] = useState('');
  const [lastActivity, setLastActivity] = useState('');
  const [mode, setMode] = useState('single');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('9');
  const [validUntil, setValidUntil] = useState('');
  const [freqDays, setFreqDays] = useState('');

  async function submit() {
    const body = {
      message,
      filter_vendor: vendor || null,
      filter_tag: tag || null,
      last_activity_months: lastActivity || null,
      mode,
      date: mode==='single'? date : null,
      hour: mode==='single'? parseInt(hour) : null,
      valid_until: mode==='recurring'? validUntil : null,
      frequency_unit: mode==='recurring'? 'days' : null,
      frequency_value: mode==='recurring'? parseInt(freqDays||0) : null,
    };
    const c = await apiPost('/api/campaigns', body);
    onCreated(c);
    setMessage('');
  }

  return (
    <Card title="Criar campanha">
      <Field label="Mensagem">
        <Textarea value={message} onChange={e=>setMessage(e.target.value)} />
      </Field>
      <Field label="Vendedor (opcional)">
        <Input value={vendor} onChange={e=>setVendor(e.target.value)} />
      </Field>
      <Field label="Tag (opcional)">
        <Input value={tag} onChange={e=>setTag(e.target.value)} />
      </Field>
      <Field label="Última atividade (meses)">
        <Input type="number" value={lastActivity} onChange={e=>setLastActivity(e.target.value)} />
      </Field>
      <Field label="Modo de envio">
        <Select value={mode} onChange={e=>setMode(e.target.value)}>
          <option value="single">Evento único</option>
          <option value="recurring">Recorrente</option>
        </Select>
      </Field>
      {mode==='single' && <>
        <Field label="Data">
          <Input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        </Field>
        <Field label="Hora">
          <Input type="number" min="0" max="23" value={hour} onChange={e=>setHour(e.target.value)} />
        </Field>
      </>}
      {mode==='recurring' && <>
        <Field label="Validade até">
          <Input type="date" value={validUntil} onChange={e=>setValidUntil(e.target.value)} />
        </Field>
        <Field label="Intervalo (dias)">
          <Input type="number" value={freqDays} onChange={e=>setFreqDays(e.target.value)} />
        </Field>
      </>}
      <Button onClick={submit} style={{marginTop:10}}>Criar campanha</Button>
    </Card>
  );
}

// --- Histórico ---
function HistoryTable({ data, onCancel, onClear, onExport }) {
  return (
    <Card
      title="Histórico"
      right={<>
        <Button variant="ghost" onClick={onExport}>Exportar CSV</Button>
        <Button variant="danger" onClick={onClear}>Limpar finalizados/erro</Button>
      </>}
    >
      <table style={{width:'100%', borderCollapse:'collapse', color:'#e5e7eb', fontSize:14}}>
        <thead>
          <tr style={{textAlign:'left', color:'#9ca3af'}}>
            <th>ID</th><th>Evento</th><th>Detalhe</th><th>Data</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map(h=>(
            <tr key={h.id} style={{borderTop:'1px solid #1f2937'}}>
              <td>{h.id}</td>
              <td>{h.event}</td>
              <td>{h.detail}</td>
              <td>{new Date(h.created_at).toLocaleString()}</td>
              <td>
                {h.event==='created' || h.event==='queued' ?
                  <Button variant="danger" onClick={()=>onCancel(h.campaign_id)}>Cancelar</Button>
                  : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// --- App principal ---
function App() {
  const [apiOnline, setApiOnline] = useState(false);
  const [view, setView] = useState('create');
  const [history, setHistory] = useState([]);

  async function refreshHistory() {
    try {
      const h = await apiGet('/api/history');
      setHistory(h);
    } catch {
      setHistory([]);
    }
  }

  useEffect(()=>{
    apiGet('/api/health').then(r=>setApiOnline(r.ok)).catch(()=>setApiOnline(false));
    refreshHistory();
  }, []);

  async function cancelCampaign(id) {
    await apiPost(`/api/campaigns/${id}/cancel`, {});
    refreshHistory();
  }
  async function clearHistory() {
    await apiDel('/api/history'); // backend já limpa
    refreshHistory();
  }

  return (
    <div style={{fontFamily:'Inter, system-ui', padding:20, background:'#0b0f1a', minHeight:'100vh'}}>
      <TopBar apiOnline={apiOnline} view={view} setView={setView} />
      <div style={{marginTop:20}}>
        {view==='create'
          ? <CreateCampaignForm onCreated={refreshHistory}/>
          : <HistoryTable data={history} onCancel={cancelCampaign} onClear={clearHistory} onExport={downloadHistoryCSV} />}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

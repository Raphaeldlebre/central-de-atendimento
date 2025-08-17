import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { apiGet, apiPost, apiDel, downloadHistoryCSV } from './api';

// Componentes base
function Card({ title, right, children }) {
  return (
    <section style={{
      background:'#121827', border:'1px solid #1f2937', borderRadius:14,
      padding:18, marginBottom:20
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
        <h3 style={{margin:0, fontSize:16, color:'#e5e7eb', fontWeight:600}}>{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function Button({ variant='primary', ...props }) {
  const styles = {
    primary: { background:'#2563eb', color:'#fff', border:'1px solid #1e40af' },
    ghost:   { background:'transparent', color:'#e5e7eb', border:'1px solid #263244' },
    danger:  { background:'#b91c1c', color:'#fff', border:'1px solid #7f1d1d' }
  }[variant];
  return (
    <button
      {...props}
      style={{
        ...styles,
        borderRadius:10, padding:'8px 14px', cursor:'pointer',
        fontWeight:600, fontSize:13
      }}
    />
  );
}

function Input(props) {
  return <input {...props} style={{
    ...props.style,
    background:'#0b1220', color:'#e5e7eb', border:'1px solid #263244',
    borderRadius:10, padding:'8px 12px', outline:'none'
  }}/>;
}
function Textarea(props) {
  return <textarea {...props} style={{
    ...props.style,
    background:'#0b1220', color:'#e5e7eb', border:'1px solid #263244',
    borderRadius:10, padding:'8px 12px', outline:'none', resize:'vertical'
  }}/>;
}
function Select(props) {
  return <select {...props} style={{
    ...props.style,
    background:'#0b1220', color:'#e5e7eb', border:'1px solid #263244',
    borderRadius:10, padding:'8px 12px', outline:'none'
  }}/>;
}

// Formulário de criação
function CreateCampaignForm({ onCreated }) {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('single');
  const [date, setDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [repeatDays, setRepeatDays] = useState('');
  const [filters, setFilters] = useState({
    useAgent:false, agent:'',
    useTag:false, tag:'',
    useLastActivity:false, lastActivityMonths:0
  });
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [alert, setAlert] = useState(null);

  async function submit() {
    const body = { message, type, date, validUntil, repeatDays, filters, link, imageUrl };
    const r = await apiPost('/api/campaigns', body);
    setAlert(`Campanha criada (id ${r.id}) ✅`);
    setMessage(''); setType('single'); setDate(''); setValidUntil('');
    setRepeatDays(''); setLink(''); setImageUrl('');
    setShowLink(false); setShowImage(false);
    onCreated?.();
    setTimeout(()=>setAlert(null), 3000);
  }

  return (
    <Card title="Criar campanha">
      <div style={{display:'grid', gap:12}}>
        {alert && <div style={{background:'#064e3b', color:'#a7f3d0', padding:8, borderRadius:8}}>{alert}</div>}

        <label>Mensagem <Textarea value={message} onChange={e=>setMessage(e.target.value)} /></label>

        <label>Tipo
          <Select value={type} onChange={e=>setType(e.target.value)}>
            <option value="single">Evento único</option>
            <option value="recurring">Evento recorrente</option>
          </Select>
        </label>

        <label>Data e hora <Input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} /></label>

        {type==='recurring' && (
          <>
            <label>Validade (até quando) <Input type="date" value={validUntil} onChange={e=>setValidUntil(e.target.value)} /></label>
            <label>Dias para repetir <Input type="number" min="1" value={repeatDays} onChange={e=>setRepeatDays(e.target.value)} /></label>
          </>
        )}

        {/* Filtros organizados */}
        <div style={{display:'grid', gap:8}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <input type="checkbox" checked={filters.useAgent} onChange={e=>setFilters({...filters, useAgent:e.target.checked})}/>
            <Input placeholder="Vendedor" value={filters.agent} onChange={e=>setFilters({...filters, agent:e.target.value})}/>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <input type="checkbox" checked={filters.useTag} onChange={e=>setFilters({...filters, useTag:e.target.checked})}/>
            <Input placeholder="Tag" value={filters.tag} onChange={e=>setFilters({...filters, tag:e.target.value})}/>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <input type="checkbox" checked={filters.useLastActivity} onChange={e=>setFilters({...filters, useLastActivity:e.target.checked})}/>
            <Input type="number" placeholder="Última atividade (meses)" value={filters.lastActivityMonths} onChange={e=>setFilters({...filters, lastActivityMonths:e.target.value})}/>
          </div>
        </div>

        {/* Link e Imagem */}
        {showLink && <Input placeholder="URL" value={link} onChange={e=>setLink(e.target.value)}/>}
        {showImage && <Input placeholder="Imagem URL" value={imageUrl} onChange={e=>setImageUrl(e.target.value)}/>}

        <div style={{display:'flex', gap:10}}>
          <Button variant="ghost" onClick={()=>setShowLink(!showLink)}>+ Adicionar link</Button>
          <Button variant="ghost" onClick={()=>setShowImage(!showImage)}>+ Adicionar imagem</Button>
          <Button onClick={submit}>🚀 Agendar</Button>
        </div>
      </div>
    </Card>
  );
}

// Histórico
function HistoryTable({ history, onClear, onCancel }) {
  return (
    <Card title="Histórico" right={
      <div style={{display:'flex', gap:10}}>
        <Button variant="ghost" onClick={()=>downloadHistoryCSV()}>⬇️ Exportar CSV</Button>
        <Button variant="ghost" onClick={onClear}>🧹 Limpar histórico</Button>
      </div>
    }>
      <table style={{width:'100%', borderSpacing:0, color:'#e5e7eb', fontSize:14}}>
        <thead>
          <tr style={{textAlign:'left', color:'#9ca3af'}}>
            <th>ID</th><th>Status</th><th>Tipo</th><th>Mensagem</th>
            <th>Filtros</th><th>Agendado/Start</th><th>Validade</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {history.length===0 ? (
            <tr><td colSpan={8} style={{padding:20, textAlign:'center', color:'#6b7280'}}>Sem registros.</td></tr>
          ):history.map(h=>(
            <tr key={h.id}>
              <td>#{h.id}</td>
              <td>{h.status}</td>
              <td>{h.type}</td>
              <td>{h.message}</td>
              <td>{JSON.stringify(h.filters)}</td>
              <td>{h.startDate || '-'}</td>
              <td>{h.validUntil || '-'}</td>
              <td>
                {(h.status==='scheduled' || h.status==='running') && (
                  <Button variant="danger" onClick={()=>onCancel(h.id)}>Cancelar</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// App principal
function App() {
  const [view, setView] = useState('create');
  const [history, setHistory] = useState([]);

  async function loadHistory() {
    const h = await apiGet('/api/history');
    setHistory(h);
  }
  async function clearHistory() {
    await apiDel('/api/history');
    loadHistory();
  }
  async function cancelCampaign(id) {
    await apiDel(`/api/campaigns/${id}`);
    loadHistory();
  }

  return (
    <div style={{padding:20, background:'#0b0f1a', minHeight:'100vh', color:'#e5e7eb'}}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:20}}>
        <h1 style={{margin:0}}>🔔 Central de Campanhas</h1>
        <div style={{display:'flex', gap:10}}>
          <Button variant={view==='create'?'primary':'ghost'} onClick={()=>setView('create')}>Criar campanha</Button>
          <Button variant={view==='history'?'primary':'ghost'} onClick={()=>{setView('history'); loadHistory();}}>Ver histórico</Button>
        </div>
      </div>

      {view==='create'
        ? <CreateCampaignForm onCreated={loadHistory}/>
        : <HistoryTable history={history} onClear={clearHistory} onCancel={cancelCampaign}/>
      }
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);



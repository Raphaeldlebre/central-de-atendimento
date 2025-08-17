import React, { useEffect, useState } from 'react';
import { listCampaigns, listHistory } from '../api';
import * as XLSX from 'xlsx';
const card={background:'#0F172A',border:'1px solid #1F2937',borderRadius:12,padding:20,marginBottom:16};
const input={background:'#0B1220',border:'1px solid #27324A',color:'#E4E8EE',padding:'10px 12px',borderRadius:8};
export default function HistoryView(){
  const [campaigns,setCampaigns]=useState([]);
  const [selected,setSelected]=useState('');
  const [rows,setRows]=useState([]);
  useEffect(()=>{ listCampaigns().then(setCampaigns).catch(()=>{}); },[]);
  useEffect(()=>{ if(!selected) return; listHistory(selected).then(setRows).catch(()=>{}); },[selected]);
  const exportExcel=()=>{ const ws=XLSX.utils.json_to_sheet(rows); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'histórico'); XLSX.writeFile(wb,`historico_${selected||'all'}.xlsx`); };
  return (<div>
    <div style={card}>
      <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
        <select value={selected} onChange={e=>setSelected(e.target.value)} style={{...input}}>
          <option value=''>Selecione uma campanha…</option>
          {campaigns.map(c=>(<option key={c.id} value={c.id}>{c.id.slice(0,8)} · {c.type} · {new Date(c.created_at).toLocaleString()}</option>))}
        </select>
        <button onClick={exportExcel} style={{background:'#1F2937', border:'1px solid #2F3B52', color:'#E4E8EE', padding:'10px 14px', borderRadius:8, cursor:'pointer'}}>Exportar Excel</button>
      </div>
      <div style={{overflow:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead><tr style={{textAlign:'left', color:'#94A3B8'}}>
            <th style={{padding:'8px 10px',borderBottom:'1px solid #243146'}}>Data</th>
            <th style={{padding:'8px 10px',borderBottom:'1px solid #243146'}}>Batch</th>
            <th style={{padding:'8px 10px',borderBottom:'1px solid #243146'}}>Status</th>
            <th style={{padding:'8px 10px',borderBottom:'1px solid #243146'}}>Total</th>
            <th style={{padding:'8px 10px',borderBottom:'1px solid #243146'}}>Enviados</th>
            <th style={{padding:'8px 10px',borderBottom:'1px solid #243146'}}>Erro</th>
          </tr></thead>
          <tbody>
            {rows.map(r=>(<tr key={r.id}>
              <td style={{padding:'8px 10px',borderBottom:'1px solid #1F2937'}}>{new Date(r.created_at).toLocaleString()}</td>
              <td style={{padding:'8px 10px',borderBottom:'1px solid #1F2937'}}>{r.batch_id||'-'}</td>
              <td style={{padding:'8px 10px',borderBottom:'1px solid #1F2937'}}>{r.status||'-'}</td>
              <td style={{padding:'8px 10px',borderBottom:'1px solid #1F2937'}}>{r.total??'-'}</td>
              <td style={{padding:'8px 10px',borderBottom:'1px solid #1F2937'}}>{r.sent??'-'}</td>
              <td style={{padding:'8px 10px',borderBottom:'1px solid #1F2937'}}>{r.error??'-'}</td>
            </tr>))}
            {!rows.length&&(<tr><td colSpan='6' style={{padding:'12px 10px',color:'#94A3B8'}}>Sem registros.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div></div>);
}

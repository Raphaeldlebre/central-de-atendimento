import React, { useMemo, useState } from 'react';
import { createCampaign } from '../api';
const card={background:'#0F172A',border:'1px solid #1F2937',borderRadius:12,padding:20,marginBottom:16};
const label={fontSize:12,color:'#94A3B8',marginBottom:6,display:'block'};
const input={background:'#0B1220',border:'1px solid #27324A',color:'#E4E8EE',padding:'10px 12px',borderRadius:8,width:'100%'};
const row={display:'grid',gridTemplateColumns:'1fr 1fr',gap:12};
const btn={background:'#2563EB',border:'1px solid #1D4ED8',color:'white',padding:'10px 14px',borderRadius:8,cursor:'pointer'};
export default function CampaignApp(){
  const [type,setType]=useState('single');
  const [message,setMessage]=useState(''); const [imageUrl,setImageUrl]=useState(''); const [link,setLink]=useState('');
  const [useAgent,setUseAgent]=useState(false); const [agent,setAgent]=useState('');
  const [useTag,setUseTag]=useState(false); const [tag,setTag]=useState('');
  const [useLastActivity,setUseLastActivity]=useState(false); const [lastActivityMonths,setLastActivityMonths]=useState('');
  const [sendDate,setSendDate]=useState(''); const [sendHour,setSendHour]=useState('');
  const [frequencyUnit,setFrequencyUnit]=useState('hour'); const [frequencyValue,setFrequencyValue]=useState(1);
  const [validityDate,setValidityDate]=useState('');
  const [loading,setLoading]=useState(false); const [result,setResult]=useState(null); const [error,setError]=useState(null);
  const schedule=useMemo(()=>{ if(type==='single'){ if(!sendDate||!sendHour) return {}; const dtIso=new Date(`${sendDate}T${sendHour}:00`).toISOString(); return {sendAt:dtIso}; } return {frequencyUnit,frequencyValue,validityDate}; },[type,sendDate,sendHour,frequencyUnit,frequencyValue,validityDate]);
  async function onSubmit(e){ e.preventDefault(); setLoading(true); setError(null); setResult(null);
    try{ const filters={useAgent,agent,useTag,tag,useLastActivity,lastActivityMonths};
      const payload={type,message,imageUrl,link,filters,schedule,frequencyUnit,frequencyValue,validityDate};
      const r=await createCampaign(payload); setResult(r);
    }catch(err){ setError(err?.response?.data||err.message||String(err)); } finally{ setLoading(false); } }
  return (<form onSubmit={onSubmit}>
    <div style={card}><div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
      <label style={{...label,marginRight:12}}>Tipo de envio</label>
      <label style={{display:'flex',alignItems:'center',gap:8}}><input type="radio" name="tipo" checked={type==='single'} onChange={()=>setType('single')}/>Envio Único</label>
      <label style={{display:'flex',alignItems:'center',gap:8}}><input type="radio" name="tipo" checked={type==='recurring'} onChange={()=>setType('recurring')}/>Recorrente</label>
    </div></div>
    <div style={card}>
      <div style={row}>
        <div><label style={label}>Mensagem</label><textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4} style={{...input,resize:'vertical'}} placeholder="Escreva a mensagem..."/></div>
        <div><label style={label}>Imagem (URL)</label><input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} style={input} placeholder="https://..."/>
             <label style={{...label,marginTop:12}}>Link (opcional)</label><input value={link} onChange={e=>setLink(e.target.value)} style={input} placeholder="https://..."/></div>
      </div>
    </div>
    <div style={card}>
      <div style={{marginBottom:12,fontSize:13,color:'#E4E8EE'}}>Filtros (aplicados no n8n)</div>
      <div style={row}>
        <div><label style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" checked={useAgent} onChange={e=>setUseAgent(e.target.checked)}/>Agente atribuído (vendedor)</label>
             {useAgent&&(<input value={agent} onChange={e=>setAgent(e.target.value)} style={{...input,marginTop:8}} placeholder="Ex.: Nonato"/>)}</div>
        <div><label style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" checked={useTag} onChange={e=>setUseTag(e.target.checked)}/>Etiquetas da conversa (Tag)</label>
             {useTag&&(<input value={tag} onChange={e=>setTag(e.target.value)} style={{...input,marginTop:8}} placeholder="Ex.: curso"/>)}</div>
      </div>
      <div style={{...row,marginTop:12}}>
        <div><label style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" checked={useLastActivity} onChange={e=>setUseLastActivity(e.target.checked)}/>Última atividade</label>
          {useLastActivity&&(<div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
            <input type="number" min="1" value={lastActivityMonths} onChange={e=>setLastActivityMonths(e.target.value.replace(/[^0-9]/g,''))} style={{...input,width:140}} placeholder="Ex.: 2"/>
            <span style={{color:'#94A3B8',fontSize:13}}>meses</span></div>)}</div>
      </div>
    </div>
    <div style={card}>{type==='single'?
      (<div style={row}><div><label style={label}>Data</label><input type="date" value={sendDate} onChange={e=>setSendDate(e.target.value)} style={input}/></div>
        <div><label style={label}>Hora (sem minutos)</label><input type="time" step="3600" value={sendHour} onChange={e=>setSendHour(e.target.value)} style={input}/></div></div>)
      :(<div style={row}><div><label style={label}>Frequência</label>
          <div style={{display:'flex',gap:8}}><input type="number" min="1" value={frequencyValue} onChange={e=>setFrequencyValue(Number(e.target.value||1))} style={{...input,width:120}}/>
            <select value={frequencyUnit} onChange={e=>setFrequencyUnit(e.target.value)} style={{...input,width:180}}>
              <option value="hour">hora</option><option value="day">dia</option><option value="month">mês</option></select></div></div>
        <div><label style={label}>Validade (até o fim do dia)</label><input type="date" value={validityDate} onChange={e=>setValidityDate(e.target.value)} style={input}/></div></div>)}</div>
    <div style={{display:'flex',gap:12,alignItems:'center'}}>
      <button type="submit" disabled={loading} style={btn}>{loading?'Enviando...':'Criar campanha'}</button>
      {result&&<span style={{color:'#34D399'}}>OK: #{(result.id||'').slice(0,8)}</span>}
      {error&&<span style={{color:'#F87171'}}>Erro: {typeof error==='string'?error:JSON.stringify(error)}</span>}
    </div></form>);}

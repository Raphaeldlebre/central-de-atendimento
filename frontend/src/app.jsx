import React, { useEffect, useState } from 'react';
import { health } from './api';
import CampaignApp from './campaign/CampaignApp';
import HistoryView from './campaign/HistoryView';
export default function App(){
  const [apiOk, setApiOk] = useState(true);
  const [tab, setTab] = useState('create');
  useEffect(()=>{ let m=true; health().then(()=>m&&setApiOk(true)).catch(()=>m&&setApiOk(false)); return ()=>{m=false}; },[]);
  return (<div style={{fontFamily:'Inter, system-ui, Arial', background:'#0B1220', minHeight:'100vh', color:'#E4E8EE'}}>
    {!apiOk && <div style={{background:'#332300', color:'#F5BE5B', padding:'8px 12px', textAlign:'center'}}>⚠️ API offline — conectei sem backend.</div>}
    <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px'}}>
      <h1 style={{margin:0, fontSize:20}}>Central de Atendimento</h1>
      <button onClick={()=> setTab(tab==='create'?'history':'create')} style={{background:'#1F2937', border:'1px solid #2F3B52', color:'#E4E8EE', padding:'8px 14px', borderRadius:8, cursor:'pointer'}}>
        {tab==='create'?'Ver histórico':'Criar campanha'}
      </button>
    </header>
    <main style={{maxWidth:1100, margin:'0 auto', padding:'0 24px 60px'}}>{tab==='create'?<CampaignApp/>:<HistoryView/>}</main>
  </div>);
}
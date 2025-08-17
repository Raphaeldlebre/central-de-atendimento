import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { apiGet, apiPost, apiDel } from './api'

function App() {
  const [health, setHealth] = useState(null)
  const [camps, setCamps] = useState([])
  const [message, setMessage] = useState('')
  const [created, setCreated] = useState(null)

  useEffect(()=>{
    apiGet('/api/health').then(setHealth).catch(()=>setHealth({ ok:false }))
    apiGet('/api/campaigns').then(setCamps).catch(()=>setCamps([]))
  }, [])

  async function createCampaign() {
    const body = { message, mode: 'single', hour: 9, block_size: 500 }
    const r = await apiPost('/api/campaigns', body)
    setCreated(r)
    const list = await apiGet('/api/campaigns')
    setCamps(list)
  }

  return (
    <div style={{ fontFamily:'Inter, system-ui', padding: 20, color:'#eaeaea', background:'#0b0f1a', minHeight:'100vh' }}>
      <h1>Central de Atendimento</h1>
      <p>API: {health?.ok ? 'online ✅' : 'offline ⚠️'}</p>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16}}>
        <section style={{background:'#131a2a', padding:16, borderRadius:12}}>
          <h2>Criar campanha</h2>
          <label>Mensagem</label>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4} style={{width:'100%'}} />
          <button onClick={createCampaign} style={{marginTop:8}}>Criar</button>
          {created && <p style={{marginTop:8}}>Criada id: {created.id}</p>}
        </section>

        <section style={{background:'#131a2a', padding:16, borderRadius:12}}>
          <h2>Campanhas</h2>
          <ul>
            {camps.map(c => <li key={c.id}>#{c.id} — {c.message} — {c.status}</li>)}
          </ul>
        </section>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)

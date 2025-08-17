import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { apiGet, apiPost } from './api'

function Badge({ color = '#444', children }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center',
      padding:'6px 12px', borderRadius:999, background:color, fontSize:12
    }}>{children}</span>
  )
}

function Card({ title, right, children }) {
  return (
    <section style={{
      background:'#121827', border:'1px solid #1f2937',
      borderRadius:14, padding:18, marginBottom:16
    }}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
        <h3 style={{margin:0, fontSize:16, color:'#e5e7eb'}}>{title}</h3>
        {right}
      </div>
      {children}
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label style={{display:'grid', gap:6, marginBottom:12}}>
      <span style={{color:'#9ca3af', fontSize:13}}>{label}</span>
      {children}
    </label>
  )
}

function Input(props) {
  return (
    <input {...props} style={{
      background:'#0b1220', color:'#e5e7eb', border:'1px solid #263244',
      borderRadius:10, padding:'10px 12px'
    }}/>
  )
}
function Textarea(props) {
  return (
    <textarea {...props} style={{
      background:'#0b1220', color:'#e5e7eb', border:'1px solid #263244',
      borderRadius:10, padding:'10px 12px', minHeight:100
    }}/>
  )
}
function Button({ variant='primary', ...props }) {
  const styles = {
    primary: { background:'#2563eb', color:'#fff', border:'1px solid #1e40af' },
    ghost:   { background:'transparent', color:'#e5e7eb', border:'1px solid #263244' },
    danger:  { background:'#b91c1c', color:'#fff', border:'1px solid #7f1d1d' }
  }[variant]
  return (
    <button {...props} style={{
      ...styles, borderRadius:10, padding:'10px 14px',
      cursor:'pointer', fontWeight:600
    }}/>
  )
}

function App() {
  const [health, setHealth] = useState(null)
  const [camps, setCamps] = useState([])

  // Form fields
  const [message, setMessage] = useState("")
  const [type, setType] = useState("single")
  const [scheduledAt, setScheduledAt] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [repeatEveryDays, setRepeatEveryDays] = useState(0)

  const [useLink, setUseLink] = useState(false)
  const [useImage, setUseImage] = useState(false)
  const [link, setLink] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  useEffect(()=>{
    apiGet('/api/health').then(setHealth).catch(()=>setHealth({ ok:false }))
    apiGet('/api/campaigns').then(setCamps).catch(()=>setCamps([]))
  }, [])

  async function createCampaign() {
    const body = {
      message, type,
      scheduledAt, validUntil, repeatEveryDays,
      link: useLink ? link : null,
      imageUrl: useImage ? imageUrl : null
    }
    const r = await apiPost('/api/campaigns', body)

    if (r?.id) {
      alert("✅ Campanha criada com sucesso!")
      // reset form
      setMessage(""); setType("single")
      setScheduledAt(""); setValidUntil("")
      setRepeatEveryDays(0); setUseLink(false)
      setUseImage(false); setLink(""); setImageUrl("")
      const list = await apiGet('/api/campaigns')
      setCamps(list)
    }
  }

  return (
    <div style={{ fontFamily:'Inter, sans-serif', padding:20, color:'#eaeaea', background:'#0b0f1a', minHeight:'100vh' }}>
      <h1 style={{marginBottom:20}}>🔔 Central de Campanhas</h1>
      <p>API: {health?.ok ? 'online ✅' : 'offline ⚠️'}</p>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
        
        {/* Criar campanha */}
        <Card title="Criar campanha">
          <Field label="Mensagem">
            <Textarea value={message} onChange={e=>setMessage(e.target.value)} />
          </Field>

          <Field label="Tipo">
            <select value={type} onChange={e=>setType(e.target.value)}
              style={{background:'#0b1220', color:'#e5e7eb', border:'1px solid #263244', borderRadius:10, padding:'10px'}}>
              <option value="single">Evento único</option>
              <option value="recurring">Evento recorrente</option>
            </select>
          </Field>

          {type === "single" && (
            <Field label="Data e hora">
              <Input type="datetime-local" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)} />
            </Field>
          )}

          {type === "recurring" && (
            <>
              <Field label="Validade">
                <Input type="date" value={validUntil} onChange={e=>setValidUntil(e.target.value)} />
              </Field>
              <Field label="Disparar a cada X dias">
                <Input type="number" value={repeatEveryDays} onChange={e=>setRepeatEveryDays(e.target.value)} />
              </Field>
            </>
          )}

          {!useLink && <Button variant="ghost" onClick={()=>setUseLink(true)}>➕ Adicionar link</Button>}
          {useLink && (
            <Field label="Link">
              <Input type="url" value={link} onChange={e=>setLink(e.target.value)} placeholder="https://..." />
            </Field>
          )}

          {!useImage && <Button variant="ghost" onClick={()=>setUseImage(true)}>➕ Adicionar imagem</Button>}
          {useImage && (
            <Field label="Imagem (URL)">
              <Input type="url" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://..." />
            </Field>
          )}

          <Button style={{marginTop:12}} onClick={createCampaign}>🚀 Agendar</Button>
        </Card>

        {/* Lista de campanhas */}
        <Card title="Campanhas">
          {camps.length === 0 && <p>Nenhuma campanha criada ainda.</p>}
          <ul>
            {camps.map(c => (
              <li key={c.id} style={{marginBottom:8}}>
                #{c.id} — {c.message} <Badge color="#1f2937">{c.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)


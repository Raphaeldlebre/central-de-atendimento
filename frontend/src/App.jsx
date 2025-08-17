import React, { useEffect, useState } from "react";
import { apiGet, apiPost, apiDel } from "./api";

export default function App() {
  const [tab, setTab] = useState("create");
  const [apiOnline, setApiOnline] = useState(false);

  // Formulário
  const [tag, setTag] = useState("");
  const [vendor, setVendor] = useState("");
  const [lastActivity, setLastActivity] = useState("");
  const [mode, setMode] = useState("single");
  const [date, setDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [interval, setInterval] = useState("");
  const [message, setMessage] = useState("");

  // extras
  const [addPhotoMsg, setAddPhotoMsg] = useState(false);
  const [photoMsg, setPhotoMsg] = useState("");
  const [addUrlMsg, setAddUrlMsg] = useState(false);
  const [urlMsg, setUrlMsg] = useState("");

  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    checkApi();
    loadCampaigns();
  }, []);

  async function checkApi() {
    try {
      await apiGet("/ping");
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    }
  }

  async function loadCampaigns() {
    try {
      const data = await apiGet("/campaigns");
      setCampaigns(data || []);
    } catch {
      setCampaigns([]);
    }
  }

  async function createCampaign() {
    const payload = {
      filter_tag: tag || null,
      filter_vendor: vendor || null,
      last_activity_months: lastActivity ? Number(lastActivity) : null,
      mode,
      date: mode === "single" ? (date || null) : null,
      valid_until: mode === "recurring" ? (validUntil || null) : null,
      frequency_value: mode === "recurring" ? (interval ? Number(interval) : null) : null,
      frequency_unit: mode === "recurring" ? "d" : null,
      message,
      image_url: addPhotoMsg ? photoMsg : null,
      link_url: addUrlMsg ? urlMsg : null,
      status: "scheduled",
      filters: {
        // opcional: mantemos filtros também em JSON
        tag: tag || null,
        vendor: vendor || null,
        lastActivityMonths: lastActivity ? Number(lastActivity) : null,
      },
    };

    await apiPost("/campaigns", payload);
    await loadCampaigns();
    resetForm();
    setTab("history");
  }

  function resetForm() {
    setTag("");
    setVendor("");
    setLastActivity("");
    setMode("single");
    setDate("");
    setValidUntil("");
    setInterval("");
    setMessage("");
    setAddPhotoMsg(false);
    setPhotoMsg("");
    setAddUrlMsg(false);
    setUrlMsg("");
  }

  async function deleteCampaign(id) {
    await apiDel(`/campaigns/${id}`);
    loadCampaigns();
  }

  async function clearHistory() {
    // remove só "done" e "error"
    const idsToDelete = campaigns
      .filter((c) => c.status === "done" || c.status === "error")
      .map((c) => c.id);
    for (let id of idsToDelete) {
      await apiDel(`/campaigns/${id}`);
    }
    loadCampaigns();
  }

  return (
    <div className="app-container">
      <header>
        <h1>📣 Central de Campanhas</h1>
        <p style={{opacity:.8, marginTop:6}}>
          API {apiOnline ? "online ✅" : "offline ⚠️"}
        </p>
      </header>

      <div className="tabs">
        <button
          className={tab === "create" ? "active" : ""}
          onClick={() => setTab("create")}
        >
          Criar Campanha
        </button>
        <button
          className={tab === "history" ? "active" : ""}
          onClick={() => { setTab("history"); loadCampaigns(); }}
        >
          Histórico
        </button>
      </div>

      {tab === "create" && (
        <div className="tab-content">
          <div className="form-group">
            <label>Tag</label>
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag" />
          </div>

          <div className="form-group">
            <label>Vendedor</label>
            <input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Vendedor" />
          </div>

          <div className="form-group">
            <label>Última atividade (meses)</label>
            <input type="number" value={lastActivity} onChange={(e) => setLastActivity(e.target.value)} placeholder="Ex: 3" />
          </div>

          <div className="form-group">
            <label>Modo de envio</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="single">Único</option>
              <option value="recurring">Recorrente</option>
            </select>
          </div>

          {mode === "single" && (
            <div className="form-group">
              <label>Data de envio</label>
              <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          )}

          {mode === "recurring" && (
            <>
              <div className="form-group">
                <label>Validade até</label>
                <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Intervalo (dias)</label>
                <input type="number" value={interval} onChange={(e) => setInterval(e.target.value)} placeholder="Ex: 7" />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Mensagem</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mensagem a ser enviada" />
          </div>

          <div className="form-group checkbox">
            <input type="checkbox" checked={addPhotoMsg} onChange={() => setAddPhotoMsg(!addPhotoMsg)} />
            <label>📷 Adicionar Mensagem para Foto</label>
          </div>
          {addPhotoMsg && (
            <div className="form-group">
              <input value={photoMsg} onChange={(e) => setPhotoMsg(e.target.value)} placeholder="URL ou legenda da foto" />
            </div>
          )}

          <div className="form-group checkbox">
            <input type="checkbox" checked={addUrlMsg} onChange={() => setAddUrlMsg(!addUrlMsg)} />
            <label>🔗 Adicionar Mensagem para URL</label>
          </div>
          {addUrlMsg && (
            <div className="form-group">
              <input value={urlMsg} onChange={(e) => setUrlMsg(e.target.value)} placeholder="URL complementar" />
            </div>
          )}

          <button className="btn-primary" onClick={createCampaign}>Criar Campanha</button>
        </div>
      )}

      {tab === "history" && (
        <div className="tab-content">
          {campaigns.length === 0 ? (
            <div style={{opacity:.8}}>Nenhuma campanha registrada.</div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Tag</th>
                    <th>Vendedor</th>
                    <th>Últ. Ativ.</th>
                    <th>Mensagem</th>
                    <th>Data / Validade / Intervalo</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.status}</td>
                      <td>{c.filter_tag || "-"}</td>
                      <td>{c.filter_vendor || "-"}</td>
                      <td>{c.last_activity_months ? `${c.last_activity_months}m` : "-"}</td>
                      <td style={{maxWidth:320, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.message}</td>
                      <td>
                        {c.mode === "single"
                          ? c.date
                          : `${c.valid_until || "-"} / ${c.frequency_value || "-"}d`}
                      </td>
                      <td>
                        {(c.status === "scheduled" || c.status === "pending") && (
                          <button className="btn-danger" onClick={() => deleteCampaign(c.id)}>❌</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button className="btn-secondary" onClick={clearHistory}>Limpar histórico</button>
          </div>
        </div>
      )}
    </div>
  );
}

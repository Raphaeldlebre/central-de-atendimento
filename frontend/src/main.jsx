import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { apiGet, apiPost } from "./api";

function App() {
  const [health, setHealth] = useState(null);
  const [camps, setCamps] = useState([]);
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState(null);
  const [view, setView] = useState("create"); // "create" ou "history"

  useEffect(() => {
    apiGet("/api/health")
      .then(setHealth)
      .catch(() => setHealth({ ok: false }));
    apiGet("/api/campaigns")
      .then(setCamps)
      .catch(() => setCamps([]));
  }, []);

  async function createCampaign() {
    const body = { message, mode: "single", hour: 9, block_size: 500 };
    const r = await apiPost("/api/campaigns", body);
    setCreated(r);
    const list = await apiGet("/api/campaigns");
    setCamps(list);
  }

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui",
        padding: 20,
        color: "#eaeaea",
        background: "#0b0f1a",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1 style={{ margin: 0 }}>📢 Central de Campanhas</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setView("create")}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: view === "create" ? "#2563eb" : "#1f2937",
              color: "white",
              cursor: "pointer",
            }}
          >
            Criar campanha
          </button>
          <button
            onClick={() => setView("history")}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: view === "history" ? "#2563eb" : "#1f2937",
              color: "white",
              cursor: "pointer",
            }}
          >
            Ver histórico
          </button>
        </div>
      </header>

      <p>
        API:{" "}
        {health?.ok ? (
          <span style={{ color: "#4ade80" }}>online ✅</span>
        ) : (
          <span style={{ color: "#fbbf24" }}>offline ⚠️</span>
        )}
      </p>

      {view === "create" && (
        <section
          style={{
            background: "#131a2a",
            padding: 16,
            borderRadius: 12,
            maxWidth: 700,
          }}
        >
          <h2>Criar campanha</h2>
          <label>Mensagem</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 8,
              border: "1px solid #374151",
              marginTop: 4,
              background: "#0f172a",
              color: "white",
            }}
          />
          <button
            onClick={createCampaign}
            style={{
              marginTop: 12,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "#2563eb",
              color: "white",
              cursor: "pointer",
            }}
          >
            Criar
          </button>
          {created && (
            <p style={{ marginTop: 8 }}>
              ✅ Campanha criada com id: {created.id}
            </p>
          )}
        </section>
      )}

      {view === "history" && (
        <section
          style={{
            background: "#131a2a",
            padding: 16,
            borderRadius: 12,
          }}
        >
          <h2>Histórico de campanhas</h2>
          {camps.length === 0 ? (
            <p style={{ opacity: 0.7 }}>Nenhuma campanha encontrada.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 10,
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8 }}>ID</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Mensagem</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {camps.map((c) => (
                  <tr key={c.id} style={{ borderTop: "1px solid #374151" }}>
                    <td style={{ padding: 8 }}>#{c.id}</td>
                    <td style={{ padding: 8 }}>{c.message}</td>
                    <td style={{ padding: 8 }}>{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);


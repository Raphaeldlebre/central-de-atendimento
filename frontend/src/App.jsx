import React, { useState } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState("criar");
  const [modoEnvio, setModoEnvio] = useState("unico");
  const [mensagemExtraFoto, setMensagemExtraFoto] = useState(false);
  const [mensagemExtraUrl, setMensagemExtraUrl] = useState(false);

  // Mock do histórico
  const [historico, setHistorico] = useState([
    { id: 1, status: "done", tag: "Promoção", vendedor: "Ana", ultima: 2, mensagem: "Oferta imperdível!", data: "2025-08-20" },
    { id: 2, status: "scheduled", tag: "Black Friday", vendedor: "Carlos", ultima: 5, mensagem: "Descontos exclusivos!", data: "2025-11-25" },
  ]);

  const limparHistorico = () => {
    setHistorico(historico.filter(h => h.status !== "done" && h.status !== "error"));
  };

  const cancelarItem = (id) => {
    setHistorico(historico.filter(h => h.id !== id));
  };

  return (
    <div className="app-container">
      <header>
        <h1>Gerenciador de Campanhas</h1>
      </header>

      <div className="tabs">
        <button 
          className={activeTab === "criar" ? "active" : ""} 
          onClick={() => setActiveTab("criar")}
        >
          Criar Campanha
        </button>
        <button 
          className={activeTab === "historico" ? "active" : ""} 
          onClick={() => setActiveTab("historico")}
        >
          Histórico
        </button>
      </div>

      {/* Aba Criar Campanha */}
      {activeTab === "criar" && (
        <div className="tab-content">
          <form className="form-campanha">
            <div className="form-group">
              <label>Tag</label>
              <input type="text" placeholder="Ex: Promoção" />
            </div>

            <div className="form-group">
              <label>Vendedor</label>
              <input type="text" placeholder="Ex: João" />
            </div>

            <div className="form-group">
              <label>Última atividade (meses)</label>
              <input type="number" placeholder="Ex: 3" />
            </div>

            <div className="form-group">
              <label>Modo de envio</label>
              <select value={modoEnvio} onChange={(e) => setModoEnvio(e.target.value)}>
                <option value="unico">Único</option>
                <option value="recorrente">Recorrente</option>
              </select>
            </div>

            {modoEnvio === "unico" && (
              <div className="form-group">
                <label>Data de envio</label>
                <input type="date" />
              </div>
            )}

            {modoEnvio === "recorrente" && (
              <>
                <div className="form-group">
                  <label>Validade até</label>
                  <input type="date" />
                </div>
                <div className="form-group">
                  <label>Intervalo (dias)</label>
                  <input type="number" placeholder="Ex: 7" />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Mensagem</label>
              <textarea placeholder="Digite a mensagem..." />
            </div>

            <div className="form-group checkbox">
              <label>
                <input type="checkbox" checked={mensagemExtraFoto} onChange={() => setMensagemExtraFoto(!mensagemExtraFoto)} />
                📷 Adicionar Mensagem para Foto
              </label>
            </div>
            {mensagemExtraFoto && (
              <div className="form-group">
                <input type="text" placeholder="Mensagem da foto" />
              </div>
            )}

            <div className="form-group checkbox">
              <label>
                <input type="checkbox" checked={mensagemExtraUrl} onChange={() => setMensagemExtraUrl(!mensagemExtraUrl)} />
                🔗 Adicionar Mensagem para URL
              </label>
            </div>
            {mensagemExtraUrl && (
              <div className="form-group">
                <input type="text" placeholder="Mensagem do link" />
              </div>
            )}

            <button type="submit" className="btn-primary">Criar Campanha</button>
          </form>
        </div>
      )}

      {/* Aba Histórico */}
      {activeTab === "historico" && (
        <div className="tab-content">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Tag</th>
                <th>Vendedor</th>
                <th>Última Atividade</th>
                <th>Mensagem</th>
                <th>Data/Validade/Intervalo</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.status}</td>
                  <td>{item.tag}</td>
                  <td>{item.vendedor}</td>
                  <td>{item.ultima} meses</td>
                  <td>{item.mensagem}</td>
                  <td>{item.data}</td>
                  <td>
                    {item.status === "scheduled" || item.status === "pending" ? (
                      <button className="btn-danger" onClick={() => cancelarItem(item.id)}>❌ Cancelar</button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="btn-secondary" onClick={limparHistorico}>
            Limpar histórico
          </button>
        </div>
      )}
    </div>
  );
}

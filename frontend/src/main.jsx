import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000/api";

export default function App() {
  const [tab, setTab] = useState("create"); // "create" | "history"
  const [apiOnline, setApiOnline] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  // form state
  const [message, setMessage] = useState("");
  const [useVendor, setUseVendor] = useState(false);
  const [vendor, setVendor] = useState("");
  const [useTag, setUseTag] = useState(false);
  const [tag, setTag] = useState("");
  const [useLastActivity, setUseLastActivity] = useState(false);
  const [lastActivity, setLastActivity] = useState("");
  const [type, setType] = useState("single");
  const [date, setDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [repeatDays, setRepeatDays] = useState(1);

  // health check
  useEffect(() => {
    axios
      .get(`${API_URL}/health`)
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
  }, []);

  // carregar histórico
  const loadCampaigns = () => {
    axios
      .get(`${API_URL}/campaigns`)
      .then((res) => setCampaigns(res.data))
      .catch(() => setCampaigns([]));
  };

  useEffect(() => {
    if (tab === "history") loadCampaigns();
  }, [tab]);

  // criar campanha
  const createCampaign = async () => {
    try {
      await axios.post(`${API_URL}/campaigns`, {
        message,
        filters: {
          useVendor,
          vendor,
          useTag,
          tag,
          useLastActivity,
          lastActivityMonths: Number(lastActivity) || 0,
        },
        type,
        scheduledAt: type === "single" ? date : null,
        validUntil: type === "recurring" ? validUntil : null,
        repeatEveryDays: type === "recurring" ? repeatDays : null,
      });
      alert("Campanha criada!");
      // limpar formulário
      setMessage("");
      setUseVendor(false);
      setVendor("");
      setUseTag(false);
      setTag("");
      setUseLastActivity(false);
      setLastActivity("");
      setDate("");
      setValidUntil("");
      setRepeatDays(1);
    } catch (err) {
      alert("Erro ao criar campanha");
    }
  };

  // cancelar campanha
  const cancelCampaign = async (id) => {
    if (!confirm("Cancelar esta campanha?")) return;
    await axios.post(`${API_URL}/campaigns/${id}/cancel`);
    loadCampaigns();
  };

  // excluir campanha
  const deleteCampaign = async (id) => {
    if (!confirm("Excluir definitivamente?")) return;
    await axios.delete(`${API_URL}/campaigns/${id}`);
    loadCampaigns();
  };

  return (
    <div className="p-6 text-white bg-[#0d1117] min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>🔔</span> Central de Campanhas
        </h1>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded text-sm ${
              apiOnline ? "bg-green-700" : "bg-red-700"
            }`}
          >
            API {apiOnline ? "online ✅" : "offline ⚠️"}
          </span>
          <button
            onClick={() => setTab("create")}
            className={`px-4 py-2 rounded ${
              tab === "create" ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            Criar campanha
          </button>
          <button
            onClick={() => setTab("history")}
            className={`px-4 py-2 rounded ${
              tab === "history" ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            Ver histórico
          </button>
        </div>
      </header>

      {tab === "create" && (
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Mensagens e filtros</h2>

          <label className="block mb-2">Mensagem</label>
          <textarea
            className="w-full p-2 rounded bg-gray-800 mb-4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escreva a mensagem..."
          />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useVendor}
                onChange={(e) => setUseVendor(e.target.checked)}
              />
              <span>Filtrar por Vendedor</span>
              <input
                type="text"
                disabled={!useVendor}
                className="flex-1 p-1 rounded bg-gray-800"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useTag}
                onChange={(e) => setUseTag(e.target.checked)}
              />
              <span>Filtrar por Tag</span>
              <input
                type="text"
                disabled={!useTag}
                className="flex-1 p-1 rounded bg-gray-800"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useLastActivity}
                onChange={(e) => setUseLastActivity(e.target.checked)}
              />
              <span>Última atividade (meses)</span>
              <input
                type="number"
                disabled={!useLastActivity}
                className="w-20 p-1 rounded bg-gray-800"
                value={lastActivity}
                onChange={(e) => setLastActivity(e.target.value)}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <label>
              Modo de envio
              <select
                className="w-full p-2 rounded bg-gray-800"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="single">Evento único</option>
                <option value="recurring">Recorrente</option>
              </select>
            </label>

            <label>
              Data/Hora
              <input
                type="datetime-local"
                className="w-full p-2 rounded bg-gray-800"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            {type === "recurring" && (
              <>
                <label>
                  Validade
                  <input
                    type="date"
                    className="w-full p-2 rounded bg-gray-800"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </label>
                <label>
                  Repetir a cada (dias)
                  <input
                    type="number"
                    className="w-full p-2 rounded bg-gray-800"
                    value={repeatDays}
                    onChange={(e) => setRepeatDays(e.target.value)}
                  />
                </label>
              </>
            )}
          </div>

          <button
            onClick={createCampaign}
            className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Agendar campanha 🚀
          </button>
        </div>
      )}

      {tab === "history" && (
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Histórico de campanhas</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th>ID</th>
                <th>Status</th>
                <th>Tipo</th>
                <th>Mensagem</th>
                <th>Filtros</th>
                <th>Agendado/Start</th>
                <th>Validade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-400">
                    Sem registros
                  </td>
                </tr>
              )}
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-800 hover:bg-gray-800"
                >
                  <td>{c.id}</td>
                  <td>{c.status}</td>
                  <td>{c.mode}</td>
                  <td>{c.message}</td>
                  <td>
                    {c.filter_vendor || c.filter_tag || c.last_activity_months
                      ? `${c.filter_vendor || ""} ${c.filter_tag || ""} ${
                          c.last_activity_months
                            ? `${c.last_activity_months}m`
                            : ""
                        }`
                      : "-"}
                  </td>
                  <td>{c.date || "-"}</td>
                  <td>{c.valid_until || "-"}</td>
                  <td className="flex gap-2">
                    {c.status === "scheduled" && (
                      <button
                        onClick={() => cancelCampaign(c.id)}
                        className="px-2 py-1 bg-yellow-600 rounded"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      onClick={() => deleteCampaign(c.id)}
                      className="px-2 py-1 bg-red-600 rounded"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


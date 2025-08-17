import React, { useMemo, useState } from 'react';
import { createCampaign } from '../api';

export default function CampaignApp() {
  const [type, setType] = useState('single');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [useAgent, setUseAgent] = useState(false);
  const [agent, setAgent] = useState('');
  const [useTag, setUseTag] = useState(false);
  const [tag, setTag] = useState('');
  const [useLastActivity, setUseLastActivity] = useState(false);
  const [lastActivityMonths, setLastActivityMonths] = useState('');
  const [sendDate, setSendDate] = useState('');
  const [sendHour, setSendHour] = useState('');
  const [frequencyUnit, setFrequencyUnit] = useState('hour');
  const [frequencyValue, setFrequencyValue] = useState(1);
  const [validityDate, setValidityDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const schedule = useMemo(() => {
    if (type === 'single') {
      if (!sendDate || !sendHour) return {};
      const dtIso = new Date(`${sendDate}T${sendHour}:00`).toISOString();
      return { sendAt: dtIso };
    }
    return { frequencyUnit, frequencyValue, validityDate };
  }, [type, sendDate, sendHour, frequencyUnit, frequencyValue, validityDate]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const filters = { useAgent, agent, useTag, tag, useLastActivity, lastActivityMonths };
      const payload = { type, message, imageUrl, link, filters, schedule, frequencyUnit, frequencyValue, validityDate };
      const r = await createCampaign(payload);
      setResult(r);
    } catch (err) {
      setError(err?.response?.data || err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Tipo de envio */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-sm text-slate-400">Tipo de envio</span>
          <label className="flex items-center gap-2">
            <input type="radio" name="tipo" checked={type==='single'} onChange={()=>setType('single')} />
            Envio Único
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="tipo" checked={type==='recurring'} onChange={()=>setType('recurring')} />
            Recorrente
          </label>
        </div>
      </div>

      {/* Mensagem / Imagem */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Mensagem</label>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 resize-y"
            placeholder="Escreva a mensagem..." />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Imagem (URL)</label>
          <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
            placeholder="https://..." />
          <label className="block text-xs text-slate-400 mt-3 mb-1">Link (opcional)</label>
          <input value={link} onChange={e=>setLink(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
            placeholder="https://..." />
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
        <div className="text-slate-200 text-sm mb-3">Filtros (aplicados no n8n)</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={useAgent} onChange={e=>setUseAgent(e.target.checked)} />
              Agente atribuído (vendedor)
            </label>
            {useAgent && (
              <input value={agent} onChange={e=>setAgent(e.target.value)}
                className="mt-2 w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                placeholder="Ex.: Nonato" />
            )}
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={useTag} onChange={e=>setUseTag(e.target.checked)} />
              Etiquetas da conversa (Tag)
            </label>
            {useTag && (
              <input value={tag} onChange={e=>setTag(e.target.value)}
                className="mt-2 w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                placeholder="Ex.: curso" />
            )}
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={useLastActivity} onChange={e=>setUseLastActivity(e.target.checked)} />
            Última atividade
          </label>
          {useLastActivity && (
            <div className="flex items-center gap-2 mt-2">
              <input type="number" min="1" value={lastActivityMonths}
                onChange={e=>setLastActivityMonths(e.target.value.replace(/[^0-9]/g,''))}
                className="w-32 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                placeholder="Ex.: 2" />
              <span className="text-slate-400 text-sm">meses</span>
            </div>
          )}
        </div>
      </div>

      {/* Agendamento */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
        {type==='single' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Data</label>
              <input type="date" value={sendDate} onChange={e=>setSendDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Hora (sem minutos)</label>
              <input type="time" step="3600" value={sendHour} onChange={e=>setSendHour(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Frequência</label>
              <div className="flex gap-2">
                <input type="number" min="1" value={frequencyValue}
                  onChange={e=>setFrequencyValue(Number(e.target.value||1))}
                  className="w-28 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200" />
                <select value={frequencyUnit} onChange={e=>setFrequencyUnit(e.target.value)}
                  className="w-40 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200">
                  <option value="hour">hora</option>
                  <option value="day">dia</option>
                  <option value="month">mês</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Validade (até o fim do dia)</label>
              <input type="date" value={validityDate} onChange={e=>setValidityDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200" />
            </div>
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="flex gap-4 items-center">
        <button type="submit" disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 border border-blue-700 text-white px-4 py-2 rounded-lg">
          {loading ? 'Enviando...' : 'Criar campanha'}
        </button>
        {result && <span className="text-green-400">OK: #{(result.id||'').slice(0,8)}</span>}
        {error && <span className="text-red-400">Erro: {typeof error==='string'?error:JSON.stringify(error)}</span>}
      </div>
    </form>
  );
}

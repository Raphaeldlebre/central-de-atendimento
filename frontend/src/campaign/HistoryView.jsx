import React, { useEffect, useState } from 'react';
import { listCampaigns, listHistory } from '../api';
import * as XLSX from 'xlsx';

export default function HistoryView() {
  const [campaigns, setCampaigns] = useState([]);
  const [selected, setSelected] = useState('');
  const [rows, setRows] = useState([]);

  useEffect(() => { listCampaigns().then(setCampaigns).catch(() => {}); }, []);
  useEffect(() => { if (!selected) return; listHistory(selected).then(setRows).catch(() => {}); }, [selected]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'histórico');
    XLSX.writeFile(wb, `historico_${selected||'all'}.xlsx`);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
      <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
        <select value={selected} onChange={e=>setSelected(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 w-full md:w-auto">
          <option value=''>Selecione uma campanha…</option>
          {campaigns.map(c=>(
            <option key={c.id} value={c.id}>
              {c.id.slice(0,8)} · {c.type} · {new Date(c.created_at).toLocaleString()}
            </option>
          ))}
        </select>
        <button onClick={exportExcel}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 px-4 py-2 rounded-lg cursor-pointer">
          Exportar Excel
        </button>
      </div>

      <div className="overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-slate-400 text-left">
              <th className="border-b border-slate-700 p-2">Data</th>
              <th className="border-b border-slate-700 p-2">Batch</th>
              <th className="border-b border-slate-700 p-2">Status</th>
              <th className="border-b border-slate-700 p-2">Total</th>
              <th className="border-b border-slate-700 p-2">Enviados</th>
              <th className="border-b border-slate-700 p-2">Erro</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id} className="text-slate-200">
                <td className="border-b border-slate-800 p-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="border-b border-slate-800 p-2">{r.batch_id||'-'}</td>
                <td className="border-b border-slate-800 p-2">{r.status||'-'}</td>
                <td className="border-b border-slate-800 p-2">{r.total??'-'}</td>
                <td className="border-b border-slate-800 p-2">{r.sent??'-'}</td>
                <td className="border-b border-slate-800 p-2">{r.error??'-'}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan="6" className="p-3 text-slate-500 text-center">Sem registros.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

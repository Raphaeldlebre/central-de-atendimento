// Helpers de API para o frontend (Vite)
const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/,''); // ex: https://central-backend-xxxx.onrender.com

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(()=> '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  // tenta JSON; se falhar, retorna texto
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export function apiGet(path) {
  return request(path, { method: 'GET' });
}

export function apiPost(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body || {}) });
}

export function apiDel(path) {
  return request(path, { method: 'DELETE' });
}

export async function downloadHistoryCSV() {
  const res = await fetch(`${BASE}/api/history/export`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'history.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export { BASE as API_BASE };

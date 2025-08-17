const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:10000';

export async function apiGet(path) {
  const r = await fetch(API_BASE + path);
  if (!r.ok) throw new Error('Erro ' + r.status);
  return r.json();
}
export async function apiPost(path, body) {
  const r = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error('Erro ' + r.status);
  return r.json();
}
export async function apiDel(path) {
  const r = await fetch(API_BASE + path, { method: 'DELETE' });
  if (!r.ok) throw new Error('Erro ' + r.status);
  return r.json();
}

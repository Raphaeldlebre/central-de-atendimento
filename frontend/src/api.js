const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:10000/api";

async function request(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.headers.get("content-type")?.includes("application/json")
    ? res.json()
    : res.text();
}

export const apiGet = (path) => request(path);
export const apiPost = (path, body) => request(path, { method: "POST", body: JSON.stringify(body) });
export const apiDel = (path) => request(path, { method: "DELETE" });

export async function downloadHistoryCSV() {
  const res = await fetch(API_BASE + "/history/export");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "historico.csv";
  a.click();
  window.URL.revokeObjectURL(url);
}

export { API_BASE };

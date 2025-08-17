
import express from "express";
import dotenv from "dotenv";
import dayjs from "dayjs";
import { v4 as uuid } from "uuid";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

dotenv.config();
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const PORT = process.env.PORT || 10000;
const DATABASE_URL = process.env.DATABASE_URL;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const BACKEND_PUBLIC_URL = process.env.BACKEND_PUBLIC_URL || `http://localhost:${PORT}`;
const ACCOUNT_ID = process.env.ACCOUNT_ID || "";
const API_ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || "";

const { Pool: PgPool } = pkg;
const pool = new PgPool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL && DATABASE_URL.includes("render.com") ? { rejectUnauthorized: false } : undefined,
});

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      create table if not exists campaigns (
        id uuid primary key,
        created_at timestamptz not null default now(),
        type text not null,
        message text not null,
        image_url text,
        link text,
        filters jsonb,
        status text not null default 'scheduled',
        schedule jsonb,
        validity_date date,
        frequency_unit text,
        frequency_value int
      );
    `);
    await client.query(`
      create table if not exists history (
        id uuid primary key,
        created_at timestamptz not null default now(),
        campaign_id uuid references campaigns(id) on delete cascade,
        batch_id text,
        status text,
        total int,
        sent int,
        error text,
        raw jsonb
      );
    `);
    await client.query("create index if not exists idx_history_campaign on history(campaign_id);");
  } finally {
    client.release();
  }
}
await initDb();

app.get("/health", async (req, res) => {
  try {
    const r = await pool.query("select 1 as ok");
    res.json({ ok: true, db: r.rows[0].ok === 1, time: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/api/campaigns", async (req, res) => {
  const { status } = req.query;
  let q = "select * from campaigns";
  const params = [];
  if (status) { q += " where status = $1"; params.push(status); }
  q += " order by created_at desc";
  const { rows } = await pool.query(q, params);
  res.json(rows);
});

app.post("/api/campaigns", async (req, res) => {
  try {
    const { type, message, imageUrl, link, filters = {}, schedule = {}, frequencyUnit, frequencyValue, validityDate } = req.body || {};
    if (!message || !type) return res.status(400).json({ error: "type e message são obrigatórios." });
    const id = uuid();
    const status = "scheduled";
    const scheduleObj = type === "single" ? { sendAt: schedule.sendAt } : { frequencyUnit, frequencyValue, validityDate };
    await pool.query(
      "insert into campaigns(id, type, message, image_url, link, filters, status, schedule, validity_date, frequency_unit, frequency_value) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
      [id, type, message, imageUrl || null, link || null, filters || {}, status, scheduleObj, validityDate || null, frequencyUnit || null, frequencyValue || null]
    );
    if (N8N_WEBHOOK_URL) {
      const payload = {
        campaignId: id,
        type, message, imageUrl, link, filters, schedule: scheduleObj,
        callbackUrl: `${BACKEND_PUBLIC_URL}/api/history`,
        chatroot: { accountId: ACCOUNT_ID, token: API_ACCESS_TOKEN }
      };
      try {
        const r = await fetch(N8N_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const respText = await r.text();
        await pool.query("insert into history(id, campaign_id, status, raw) values($1,$2,$3,$4)", [uuid(), id, r.ok ? "queued" : "error", { n8nResponse: respText }]);
      } catch (err) {
        await pool.query("insert into history(id, campaign_id, status, error) values($1,$2,$3,$4)", [uuid(), id, "error", String(err)]);
      }
    }
    const { rows } = await pool.query("select * from campaigns where id = $1", [id]);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post("/api/campaigns/:id/cancel", async (req, res) => {
  const { id } = req.params;
  await pool.query("update campaigns set status = 'canceled' where id = $1", [id]);
  await pool.query("insert into history(id, campaign_id, status) values($1,$2,$3)", [uuid(), id, "canceled"]);
  res.json({ ok: true });
});

app.post("/api/history", async (req, res) => {
  try {
    const { campaignId, batchId, status, total, sent, error, raw } = req.body || {};
    if (!campaignId) return res.status(400).json({ error: "campaignId obrigatório" });
    await pool.query("insert into history(id, campaign_id, batch_id, status, total, sent, error, raw) values($1,$2,$3,$4,$5,$6,$7,$8)",
      [uuid(), campaignId, batchId || null, status || null, total || null, sent || null, error || null, raw || {}]);
    if (status === "success" || status === "finished" || status === "error") {
      await pool.query("update campaigns set status = $2 where id = $1", [campaignId, status === "error" ? "finished" : "finished"]);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get("/api/history", async (req, res) => {
  const { campaignId } = req.query;
  let q = "select * from history";
  const params = [];
  if (campaignId) { q += " where campaign_id = $1"; params.push(campaignId); }
  q += " order by created_at desc";
  const { rows } = await pool.query(q, params);
  res.json(rows);
});

app.post("/api/send", async (req, res) => {
  try {
    if (!ACCOUNT_ID || !API_ACCESS_TOKEN) {
      return res.status(500).json({ error: "Backend sem credenciais (ACCOUNT_ID/API_ACCESS_TOKEN)." });
    }
    const url = `https://api.chatroot.com/accounts/${ACCOUNT_ID}/messages`;
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_ACCESS_TOKEN}` }, body: JSON.stringify(req.body) });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: "Erro Chatroot", detail: data });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || "Erro ao enviar via proxy" });
  }
});

import fs from "fs";
const frontendBuildPath = path.join(__dirname, "frontend", "build");
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendBuildPath, "index.html"));
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from "express";
import { query } from "../db.js";
import fetch from "node-fetch";

const router = express.Router();

// Listar campanhas
router.get("/", async (req, res) => {
  try {
    const result = await query("select * from campaigns order by created_at desc");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar campanhas" });
  }
});

// Criar campanha
router.post("/", async (req, res) => {
  try {
    const {
      message,
      image_url,
      link_url,
      filter_vendor,
      filter_tag,
      last_activity_months,
      mode,
      date,
      hour,
      block_size,
      frequency_value,
      frequency_unit,
      valid_until,
      status,
      filters,
    } = req.body;

    const result = await query(
      `insert into campaigns
        (message, image_url, link_url, filter_vendor, filter_tag, last_activity_months,
         mode, date, hour, block_size, frequency_value, frequency_unit, valid_until,
         status, filters)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       returning *`,
      [
        message,
        image_url,
        link_url,
        filter_vendor,
        filter_tag,
        last_activity_months,
        mode,
        date,
        hour,
        block_size,
        frequency_value,
        frequency_unit,
        valid_until,
        status,
        filters,
      ]
    );

    const created = result.rows[0];
    res.json(created);

    // 🔔 Notificar n8n se configurado
    try {
      const webhook = process.env.N8N_WEBHOOK_URL;
      if (webhook) {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(created),
        });
      }
    } catch (err) {
      console.error("Falha ao notificar n8n:", err);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar campanha" });
  }
});

// Excluir campanha
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await query("delete from campaigns where id = $1", [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir/cancelar campanha" });
  }
});

export default router;



import express from "express";
import { query } from "../db.js";
import { stringify } from "csv-stringify/sync";

const router = express.Router();

// Listar histórico
router.get("/", async (req, res) => {
  try {
    const result = await query("select * from history order by created_at desc");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar histórico" });
  }
});

// Exportar histórico em CSV
router.get("/export", async (req, res) => {
  try {
    const result = await query(
      `select h.id, h.campaign_id, h.event, h.detail, h.created_at,
              c.message as campaign_message
         from history h
         left join campaigns c on h.campaign_id = c.id
        order by h.created_at desc`
    );

    const csv = stringify(result.rows, { header: true });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=historico.csv");
    res.send(csv);
  } catch (err) {
    console.error("Erro ao exportar histórico:", err);
    res.status(500).json({ error: "Erro ao exportar histórico" });
  }
});

export default router;


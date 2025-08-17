import express from "express";
import cors from "cors";

import campaignsRouter from "./routes/campaigns.js";
import historyRouter from "./routes/history.js";

const app = express();

app.use(cors()); // CORS liberado
app.use(express.json());

// Healthcheck
app.get("/ping", (req, res) => res.json({ ok: true }));

// Rotas
app.use("/campaigns", campaignsRouter);
app.use("/history", historyRouter);

// Rota raiz
app.get("/", (req, res) => {
  res.send("✅ API do Central de Atendimento rodando!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 API pronta na porta ${PORT}`);
});

# Central de Atendimento — Monorepo (Frontend + Backend + Render)

## Estrutura
- `frontend/` → Vite + React (usa `VITE_API_BASE` para falar com o backend)
- `backend/` → Express + Postgres + n8n
- `render.yaml` → cria 2 serviços no Render (backend + frontend)

## Como usar
1. **Copie `local.env` → `backend/.env` e ajuste se quiser.** (não comitar)
2. **Backend local**
   ```bash
   cd backend
   npm install
   npm run migrate
   npm run dev
   ```
   API: http://localhost:10000

3. **Frontend local**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   App: http://localhost:5173

4. **Deploy no Render**
   - Conecte o repositório.
   - O Render lê `render.yaml` e cria:
     - Web Service: `central-backend` (rootDir=backend)
     - Static Site: `central-frontend` (rootDir=frontend)
   - Defina no backend as envs (DATABASE_URL, API_ACCESS_TOKEN, etc).
   - No frontend, `VITE_API_BASE` deve apontar para a URL pública do backend.

## Endpoints do backend
- `GET /api/health`
- `GET /api/campaigns`
- `POST /api/campaigns`
- `DELETE /api/campaigns/:id`
- `POST /api/campaigns/:id/cancel`
- `GET /api/history`
- `DELETE /api/history`
- `GET /api/history/export`
- `POST /api/history` (callback do n8n)


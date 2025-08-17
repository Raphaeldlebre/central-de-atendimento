import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { campaignsRouter } from './routes/campaigns.js';
import { historyRouter } from './routes/history.js';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));
app.use(cors({
  origin: (origin, cb) => {
    const allowed = process.env.CORS_ORIGIN || '*';
    if (allowed === '*' || !origin) return cb(null, true);
    const ok = allowed.split(',').map(s=>s.trim()).includes(origin);
    return cb(ok ? null : new Error('Not allowed by CORS'), ok);
  }
}));

app.get('/api/health', (req,res)=> res.json({ ok:true, ts: new Date().toISOString() }));
app.use('/api/campaigns', campaignsRouter);
app.use('/api/history', historyRouter);

const port = process.env.PORT || 10000;
app.listen(port, ()=> console.log('API pronta na porta', port));

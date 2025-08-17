import express from 'express';
import { query } from '../db.js';
import { stringify } from 'csv-stringify';

export const historyRouter = express.Router();

historyRouter.get('/', async (req,res)=>{
  const { rows } = await query(`
    select h.*, c.message, c.mode 
    from history h
    left join campaigns c on c.id = h.campaign_id
    order by h.id desc
  `);
  res.json(rows);
});

historyRouter.delete('/', async (req,res)=>{
  await query('truncate table history restart identity');
  res.json({ ok:true });
});

historyRouter.get('/export', async (req,res)=>{
  const { rows } = await query(`
    select h.id, h.created_at, h.event, h.detail, h.campaign_id
    from history h order by h.id desc
  `);
  res.setHeader('Content-Type','text/csv; charset=utf-8');
  res.setHeader('Content-Disposition','attachment; filename="history.csv"');
  const stringifier = stringify({ header:true });
  stringifier.pipe(res);
  rows.forEach(r => stringifier.write(r));
  stringifier.end();
});

historyRouter.post('/', async (req,res)=>{
  // callback do n8n
  const { campaignId, status, error, total, sent, batchId, raw } = req.body || {};
  if (!campaignId) return res.status(400).json({ error: 'campaignId obrigatório' });
  await query(`insert into history (campaign_id, event, detail) values ($1,$2,$3)`,
    [campaignId, status || 'update', error || JSON.stringify({ total, sent, batchId, raw })]);
  res.json({ ok:true });
});

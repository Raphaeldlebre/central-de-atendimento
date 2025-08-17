import express from 'express';
import { query } from '../db.js';
import fetch from 'node-fetch';

export const campaignsRouter = express.Router();

// listar
campaignsRouter.get('/', async (req,res)=>{
  const { rows } = await query('select * from campaigns order by id desc');
  res.json(rows);
});

// criar
campaignsRouter.post('/', async (req,res)=>{
  const c = req.body || {};

  // converte dados do frontend
  let date = null, hour = null, frequency_value = null, frequency_unit = null;
  if (c.type === 'single' && c.scheduledAt) {
    const d = new Date(c.scheduledAt);
    date = d.toISOString().slice(0,10);
    hour = d.getUTCHours();
  }
  if (c.type === 'recurring') {
    frequency_value = c.repeatEveryDays || 1;
    frequency_unit = 'days';
  }

  // insere no banco com filtros
  const { rows } = await query(`
    insert into campaigns
      (message, image_url, link_url, mode, date, hour,
       frequency_value, frequency_unit, valid_until, status, filters)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    returning *`,
    [
      c.message,
      c.imageUrl || null,
      c.link || null,
      c.type || 'single',
      date,
      hour,
      frequency_value,
      frequency_unit,
      c.validUntil || null,
      'scheduled',
      c.filters ? JSON.stringify(c.filters) : '{}'
    ]
  );
  const camp = rows[0];

  // registra histórico
  await query(`insert into history (campaign_id, event, detail) values ($1,$2,$3)`,
    [camp.id, 'created', 'Campanha criada']);

  // envia para o n8n se configurado
  if (process.env.N8N_WEBHOOK_URL) {
    const payload = {
      campaignId: camp.id,
      type: camp.mode,
      message: camp.message,
      imageUrl: camp.image_url,
      link: camp.link_url,
      filters: c.filters || {},
      schedule: camp.mode === 'single'
        ? { sendAt: c.scheduledAt }
        : { frequencyUnit: frequency_unit, frequencyValue: frequency_value, validityDate: c.validUntil },
      callbackUrl: (process.env.BACKEND_PUBLIC_URL || '') + '/api/history',
      chatroot: { accountId: process.env.ACCOUNT_ID || '2', token: process.env.API_ACCESS_TOKEN || '' }
    };
    try {
      await fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await query(`insert into history (campaign_id, event, detail) values ($1,$2,$3)`,
        [camp.id, 'queued', 'Enviado para n8n']);
    } catch (e) {
      await query(`insert into history (campaign_id, event, detail) values ($1,$2,$3)`,
        [camp.id, 'error', String(e.message || e)]);
    }
  }

  res.status(201).json(camp);
});

// cancelar
campaignsRouter.post('/:id/cancel', async (req,res)=>{
  const id = Number(req.params.id);
  await query('update campaigns set status=$1 where id=$2',['canceled', id]);
  await query(`insert into history (campaign_id, event, detail) values ($1,$2,$3)`,
    [id, 'canceled', 'Cancelada pelo usuário']);
  res.json({ ok:true });
});

// deletar
campaignsRouter.delete('/:id', async (req,res)=>{
  const id = Number(req.params.id);
  await query('delete from campaigns where id=$1',[id]);
  res.json({ ok:true });
});


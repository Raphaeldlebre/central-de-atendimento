import express from 'express';
import { query } from '../db.js';
import fetch from 'node-fetch';

export const campaignsRouter = express.Router();

// list
campaignsRouter.get('/', async (req,res)=>{
  const status = req.query.status;
  let sql = 'select * from campaigns';
  const params = [];
  if (status && status !== 'all') {
    params.push(status);
    sql += ' where status = $1';
  }
  sql += ' order by id desc';
  const { rows } = await query(sql, params);
  res.json(rows);
});

// create
campaignsRouter.post('/', async (req,res)=>{
  const c = req.body || {};
  const fields = [
    'message','image_url','link_url','filter_vendor','filter_tag','last_activity_months',
    'mode','date','hour','block_size','frequency_value','frequency_unit','valid_until','status'
  ];
  const values = fields.map(k => c[k] ?? null);
  values[13] = c.status ?? 'scheduled';

  const placeholders = fields.map((_,i)=>'$'+(i+1)).join(',');
  const { rows } = await query(
    `insert into campaigns (${fields.join(',')}) values (${placeholders}) returning *`, values
  );
  const camp = rows[0];

  // registra no histórico
  await query(`insert into history (campaign_id, event, detail) values ($1,$2,$3)`,
    [camp.id, 'created', 'Campanha criada']);

  // dispara no n8n (opcional)
  if (process.env.N8N_WEBHOOK_URL) {
    const payload = {
      campaignId: camp.id,
      type: camp.mode === 'single' ? 'single' : 'recurring',
      message: camp.message,
      imageUrl: camp.image_url,
      link: camp.link_url,
      filters: {
        useAgent: !!camp.filter_vendor, agent: camp.filter_vendor || '',
        useTag: !!camp.filter_tag, tag: camp.filter_tag || '',
        useLastActivity: !!camp.last_activity_months, lastActivityMonths: camp.last_activity_months || 0
      },
      schedule: camp.mode === 'single'
        ? { sendAt: camp.date ? `${camp.date}T${String(camp.hour||0).padStart(2,'0')}:00:00Z` : null }
        : { frequencyUnit: camp.frequency_unit, frequencyValue: camp.frequency_value, validityDate: camp.valid_until },
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

// delete
campaignsRouter.delete('/:id', async (req,res)=>{
  const id = Number(req.params.id);
  await query('delete from campaigns where id=$1',[id]);
  res.json({ ok:true });
});

// cancel
campaignsRouter.post('/:id/cancel', async (req,res)=>{
  const id = Number(req.params.id);
  await query('update campaigns set status=$1 where id=$2',['canceled', id]);
  await query(`insert into history (campaign_id, event, detail) values ($1,$2,$3)`,
    [id, 'canceled', 'Cancelada pelo usuário']);
  res.json({ ok:true });
});

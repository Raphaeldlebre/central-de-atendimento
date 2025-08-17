import 'dotenv/config';
import { query } from './db.js';

async function migrate() {
  await query(`
    create table if not exists campaigns (
      id serial primary key,
      message text not null,
      image_url text,
      link_url text,
      filter_vendor text,
      filter_tag text,
      last_activity_months int,
      mode varchar(20) not null default 'single',
      date date,
      hour int,
      block_size int default 500,
      frequency_value int,
      frequency_unit varchar(20),
      valid_until date,
      status varchar(20) not null default 'scheduled',
      created_at timestamptz not null default now()
    );
    create table if not exists history (
      id serial primary key,
      campaign_id int references campaigns(id) on delete cascade,
      event varchar(50) not null,
      detail text,
      created_at timestamptz not null default now()
    );
    create index if not exists idx_history_campaign on history(campaign_id);
  `);
  console.log("✔ Migração aplicada.");
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});

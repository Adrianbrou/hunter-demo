-- =============================================================
-- Hunter Demo: Initial Schema
-- =============================================================
-- Run this in Supabase SQL Editor before running seed.sql
-- =============================================================

-- Drop existing tables (safe for fresh project, idempotent)
drop table if exists logs cascade;
drop table if exists machines cascade;
drop table if exists knowledge_base cascade;

-- =============================================================
-- machines: the three extrusion lines at Huntersville
-- =============================================================
create table machines (
  id text primary key,                   -- e.g., 'line-1', 'line-2', 'line-3'
  name text not null,                    -- e.g., 'Line 1 — 230kV Underground'
  product text not null,                 -- what cable this line produces
  current_project text,                  -- which customer project is running on this line
  status text not null default 'idle'    -- 'running' | 'idle' | 'alarm'
    check (status in ('running', 'idle', 'alarm')),

  -- Current operational metrics
  extrusion_temp_c numeric,              -- celsius
  line_speed_mpm numeric,                -- meters per minute
  conductor_diameter_mm numeric,
  insulation_thickness_mm numeric,

  -- Baselines for anomaly detection
  baseline_temp_c numeric not null,
  baseline_speed_mpm numeric not null,

  notes text,
  updated_at timestamptz not null default now()
);

-- Enable Realtime for live status updates
alter publication supabase_realtime add table machines;

-- =============================================================
-- logs: the live log feed for each machine
-- =============================================================
create table logs (
  id bigserial primary key,
  machine_id text not null references machines(id) on delete cascade,
  ts timestamptz not null default now(),
  severity text not null default 'info'
    check (severity in ('info', 'warning', 'error', 'anomaly')),
  message text not null,

  -- Detected anomaly metadata
  is_anomaly boolean not null default false,
  anomaly_type text,                    -- e.g., 'speed_deviation', 'temp_drift', 'material_alert'
  anomaly_score numeric,                -- 0 to 1, how confident

  -- Optional sensor snapshot for grounding Hunter responses
  sensor_snapshot jsonb
);

create index logs_machine_ts_idx on logs (machine_id, ts desc);
create index logs_anomaly_idx on logs (is_anomaly) where is_anomaly = true;

-- Enable Realtime for live log streaming
alter publication supabase_realtime add table logs;

-- =============================================================
-- knowledge_base: seeded maintenance and troubleshooting docs
-- This is what Hunter searches when grounding its answers
-- =============================================================
create table knowledge_base (
  id bigserial primary key,
  doc_id text unique not null,           -- e.g., 'KB-001'
  title text not null,
  category text not null,                -- e.g., 'troubleshooting', 'maintenance', 'safety'
  applies_to text[],                     -- machine ids this doc applies to, or ['all']
  content text not null,                 -- the actual document body
  keywords text[],                       -- for simple keyword retrieval
  created_at timestamptz not null default now()
);

create index kb_keywords_idx on knowledge_base using gin (keywords);

-- =============================================================
-- Helper view: the last 50 logs across all machines
-- Useful for Hunter context retrieval and the live feed
-- =============================================================
create or replace view recent_logs as
select l.*, m.name as machine_name, m.product
from logs l
join machines m on m.id = l.machine_id
order by l.ts desc
limit 50;

-- =============================================================
-- Grant read access for the anon role (it's a demo)
-- =============================================================
grant select on machines to anon;
grant select on logs to anon;
grant select on knowledge_base to anon;
grant select on recent_logs to anon;

-- For the simulate-logs script (uses service_role anyway, but explicit)
grant insert, update on machines to anon;
grant insert on logs to anon;
grant usage on sequence logs_id_seq to anon;

-- =============================================================
-- Note: RLS is intentionally NOT enabled for this demo.
-- For a real Southwire deployment, RLS policies would scope
-- read/write access to authenticated users by plant, role, etc.
-- =============================================================

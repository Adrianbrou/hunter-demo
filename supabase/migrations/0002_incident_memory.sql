-- =============================================================
-- Hunter Demo: Incident Memory
-- =============================================================
-- Captures the institutional memory of past resolved anomalies on
-- each line. Hunter uses these so its answers cite the team's
-- actual past fixes alongside the manual.
-- =============================================================

create table incident_memory (
  id bigserial primary key,
  occurred_at timestamptz not null default now(),
  machine_id text not null references machines(id) on delete cascade,
  anomaly_type text not null,
  symptom text not null,
  root_cause text not null,
  fix_applied text not null,
  fixed_by text,
  resolution_minutes int,
  outcome text not null default 'resolved'
    check (outcome in ('resolved', 'recurred', 'escalated')),
  notes text
);

create index incident_memory_machine_idx
  on incident_memory (machine_id, occurred_at desc);
create index incident_memory_anomaly_idx
  on incident_memory (anomaly_type);

-- Realtime so a new logged fix shows up immediately
alter publication supabase_realtime add table incident_memory;

-- Anon can read all incidents and insert new ones (demo has no auth)
grant select on incident_memory to anon;
grant insert on incident_memory to anon;
grant usage on sequence incident_memory_id_seq to anon;

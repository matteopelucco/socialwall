-- ============================================================
-- SocialWall – Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Sessions: one per user who completes the quiz
create table if not exists sessions (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  punteggio       integer not null default 0,
  totale_domande  integer not null default 10,
  created_at      timestamptz not null default now()
);

-- Dediche: messages left by guests
create table if not exists dediche (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references sessions(id) on delete cascade,
  nome_firma  text not null,
  testo       text not null check (char_length(testo) <= 500),
  created_at  timestamptz not null default now()
);

-- Typing status: who is currently typing (ephemeral)
create table if not exists typing_status (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null unique,
  nome        text not null,
  last_seen   timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- Public access (no auth) — suitable for a local event
-- ============================================================

alter table sessions      enable row level security;
alter table dediche       enable row level security;
alter table typing_status enable row level security;

create policy "public_sessions"
  on sessions for all using (true) with check (true);

create policy "public_dediche"
  on dediche for all using (true) with check (true);

create policy "public_typing"
  on typing_status for all using (true) with check (true);

-- ============================================================
-- Realtime
-- ============================================================

alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table dediche;
alter publication supabase_realtime add table typing_status;

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists idx_dediche_created_at
  on dediche (created_at desc);

create index if not exists idx_sessions_punteggio
  on sessions (punteggio desc);

create index if not exists idx_typing_last_seen
  on typing_status (last_seen desc);

-- ============================================================
-- Utility: view for leaderboard (top 10)
-- ============================================================

create or replace view leaderboard as
  select
    nome,
    punteggio,
    totale_domande,
    created_at,
    round(punteggio::numeric / totale_domande * 100) as percentuale
  from sessions
  order by punteggio desc, created_at asc
  limit 10;

-- ============================================================
-- CALCULATEUR DE MARGE — Sauvegarde cloud des clients/chantiers
-- À coller dans Supabase Studio → SQL Editor → New query → Run
-- ============================================================
-- Permet de sauvegarder durablement les clients/chantiers de chaque
-- utilisateur sous un « code personnel ». Le code sert de clé d'accès :
-- on retrouve ses données partout (autre appareil, après vidage de
-- cache) en saisissant ce code.
-- ============================================================

create table if not exists public.app_state (
  id          text primary key,          -- ex: 'clients:prenom-1234'
  payload     jsonb not null,            -- { clients, cIdCtr, chIdCtr, updated_at }
  updated_at  timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- Lecture : possible pour qui connaît l'id (le code).
drop policy if exists "app_state_select_anon" on public.app_state;
create policy "app_state_select_anon"
  on public.app_state for select
  to anon, authenticated
  using (true);

-- Insertion : payload borné à ~1 Mo.
drop policy if exists "app_state_insert_anon" on public.app_state;
create policy "app_state_insert_anon"
  on public.app_state for insert
  to anon, authenticated
  with check (pg_column_size(payload) < 1048576);

-- Mise à jour : nécessaire pour ré-enregistrer le même code (upsert).
drop policy if exists "app_state_update_anon" on public.app_state;
create policy "app_state_update_anon"
  on public.app_state for update
  to anon, authenticated
  using (true)
  with check (pg_column_size(payload) < 1048576);

-- Pas de DELETE pour anon.

-- ============================================================
-- ✅ FIN — Vérifie le message « Success » en bas à droite.
-- ============================================================

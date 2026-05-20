-- ============================================================
-- CALCULATEUR DE MARGE — Table de partage d'équipe (liens courts)
-- À coller dans Supabase Studio → SQL Editor → New query → Run
-- ============================================================
-- Objectif : au lieu d'encoder toute l'équipe dans l'URL (lien de
-- 5 000–20 000 caractères, cassé par les mails), on stocke le payload
-- ici et on partage un lien court : .../#s=<id>.
-- ============================================================

-- 1) TABLE -----------------------------------------------------
create table if not exists public.shares (
  id          text primary key,                 -- id court (ex: 'a8f3k2q1')
  kind        text not null default 'team',     -- type de partage (extensible)
  payload     jsonb not null,                   -- l'état complet de l'équipe
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '90 days')
);

-- Index pour le nettoyage des partages expirés
create index if not exists shares_expires_idx on public.shares(expires_at);

-- 2) ROW LEVEL SECURITY ---------------------------------------
alter table public.shares enable row level security;

-- N'importe qui (clé anon) peut CRÉER un partage.
-- Sécurité : on borne la taille du payload (~512 Ko) pour éviter l'abus,
-- et on interdit toute date d'expiration > 1 an.
drop policy if exists "shares_insert_anon" on public.shares;
create policy "shares_insert_anon"
  on public.shares for insert
  to anon, authenticated
  with check (
    pg_column_size(payload) < 524288
    and expires_at <= now() + interval '366 days'
  );

-- N'importe qui (clé anon) peut LIRE un partage non expiré.
drop policy if exists "shares_select_anon" on public.shares;
create policy "shares_select_anon"
  on public.shares for select
  to anon, authenticated
  using (expires_at > now());

-- Pas de policy UPDATE ni DELETE pour anon : un lien partagé est
-- immuable et ne peut pas être supprimé depuis le navigateur.

-- 3) NETTOYAGE AUTOMATIQUE (optionnel) ------------------------
-- Supprime chaque jour les partages expirés. Nécessite l'extension
-- pg_cron (Dashboard → Database → Extensions → activer "pg_cron").
-- Si tu ne l'actives pas, ce n'est pas grave : la policy de lecture
-- filtre déjà les liens expirés, ils deviennent juste inaccessibles.
--
-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'purge-expired-shares',
--   '0 3 * * *',                                 -- tous les jours à 3h
--   $$ delete from public.shares where expires_at < now() $$
-- );

-- ============================================================
-- ✅ FIN — Vérifie le message "Success" en bas à droite.
-- ============================================================

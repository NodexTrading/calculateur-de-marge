-- ============================================================
-- Nettoyage des partages de TEST créés pendant la mise en place
-- À coller dans Supabase Studio → SQL Editor → Run (optionnel)
-- ============================================================
delete from public.shares where id like 'test%' or id like 'exp%';

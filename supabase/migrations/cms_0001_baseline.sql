-- =============================================================================
-- cms_0001_baseline.sql
-- Baseline consolidata di @agency/core-cms — 2026-08-11
--
-- Ricostruita per introspezione dal database reale, non dai file di migration:
-- questi ultimi si erano rivelati non corrispondenti allo stato effettivo (il
-- registro schema_migrations dichiarava applicate migrazioni assenti, e
-- viceversa oggetti presenti non risultavano da nessuna migrazione).
--
-- Idempotente: applicabile sia su database vuoto sia sopra un'installazione
-- esistente. Da qui in avanti ogni modifica è una migrazione incrementale
-- numerata dopo questa, MAI una modifica a questo file.
--
-- Prefisso a namespace: i tre pacchetti hanno serie separate, quindi non
-- possono più collidere quando finiscono nella stessa cartella del client.
--
-- Ordine di applicazione: auth -> gym -> cms.
-- Richiede @agency/core-auth per is_gym_admin().
-- =============================================================================

-- ======================= cms_landing_settings =======================

CREATE TABLE IF NOT EXISTS public."cms_landing_settings" (
  "id" uuid DEFAULT gen_random_uuid(),
  "tenant_id" text DEFAULT 'mythos'::text,
  "banner_config" jsonb DEFAULT '{"type": "info", "message": "", "isActive": false}'::jsonb,
  "promotions_config" jsonb DEFAULT '[]'::jsonb,
  "featured_items" jsonb DEFAULT '{"staff": [], "courses": [], "memberships": []}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "cms_landing_settings_pkey" PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cms_landing_settings_tenant ON public.cms_landing_settings USING btree (tenant_id);

ALTER TABLE public."cms_landing_settings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rls_cms_admin" ON public."cms_landing_settings";
CREATE POLICY "rls_cms_admin" ON public."cms_landing_settings"
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "rls_cms_gym_admin" ON public."cms_landing_settings";
CREATE POLICY "rls_cms_gym_admin" ON public."cms_landing_settings"
  FOR ALL TO public
  USING ((COALESCE(((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text), 'member'::text) = 'gym_admin'::text))
  WITH CHECK ((COALESCE(((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text), 'member'::text) = 'gym_admin'::text));

DROP POLICY IF EXISTS "rls_cms_select" ON public."cms_landing_settings";
CREATE POLICY "rls_cms_select" ON public."cms_landing_settings"
  FOR SELECT TO public
  USING (true);

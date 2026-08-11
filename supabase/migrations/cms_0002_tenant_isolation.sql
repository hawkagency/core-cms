-- =============================================================================
-- cms_0002_tenant_isolation.sql  (@agency/core-cms)
--
-- La policy rls_cms_gym_admin era `role = 'gym_admin'` senza alcun predicato di
-- tenant: un amministratore della palestra A poteva riscrivere banner,
-- promozioni e contenuti della landing page della palestra B.
--
-- In più il controllo leggeva il claim grezzo del JWT, quindi non riconosceva
-- `super_admin` (a differenza di is_gym_admin()) e non aveva il fallback sulla
-- tabella profiles per gli utenti il cui claim non è ancora aggiornato.
--
-- Applicare dopo auth_0002_tenant_isolation.sql.
-- =============================================================================

DROP POLICY IF EXISTS "rls_cms_gym_admin" ON public.cms_landing_settings;
CREATE POLICY "rls_cms_gym_admin" ON public.cms_landing_settings
  FOR ALL TO authenticated
  USING      (public.is_gym_admin() AND tenant_id = public.current_tenant_id())
  WITH CHECK (public.is_gym_admin() AND tenant_id = public.current_tenant_id());

-- La lettura resta pubblica: sono i contenuti che la palestra pubblica sul
-- proprio sito. Il filtro per tenant su quelle query lo applica l'applicazione.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'cms_landing_settings_tenant_id_fkey'
                   AND conrelid = 'public.cms_landing_settings'::regclass) THEN
    ALTER TABLE public.cms_landing_settings
      ADD CONSTRAINT cms_landing_settings_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);
  END IF;
END $$;

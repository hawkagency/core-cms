-- =============================================================================
-- cms_0003_tenant_autofill.sql  (@agency/core-cms)
--
-- Anche cms_landing_settings aveva DEFAULT 'mythos': il nome del primo cliente
-- cablato nello schema. Su un'istanza condivisa una riga scritta senza tenant
-- esplicito finirebbe nella landing page della palestra sbagliata.
--
-- Applicare dopo auth_0003_tenant_autofill.sql.
-- =============================================================================

ALTER TABLE public.cms_landing_settings ALTER COLUMN tenant_id DROP DEFAULT;

DROP TRIGGER IF EXISTS trg_set_tenant_id ON public.cms_landing_settings;
CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.cms_landing_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_from_context();

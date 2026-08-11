-- 001_cms_schema.sql (@agency/core-cms)
-- Migrazione per la gestione dei contenuti delle Landing Page

CREATE TABLE IF NOT EXISTS public.cms_landing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'mythos',
  banner_config JSONB NOT NULL DEFAULT '{"isActive": false, "message": "", "type": "info"}'::jsonb,
  promotions_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured_items JSONB NOT NULL DEFAULT '{"courses": [], "memberships": [], "staff": []}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assicuriamoci che ogni tenant abbia solo una riga (Unique Constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cms_landing_settings_tenant 
  ON public.cms_landing_settings(tenant_id);

-- RLS
ALTER TABLE public.cms_landing_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rls_cms_select" ON public.cms_landing_settings;
DROP POLICY IF EXISTS "rls_cms_admin" ON public.cms_landing_settings;

CREATE POLICY "rls_cms_select" ON public.cms_landing_settings
  FOR SELECT USING (true);

-- Policy base di admin (dipende da come è implementato is_gym_admin in core-gym, 
-- se vogliamo renderla fotocopiabile e generica, usiamo solo service_role dal server,
-- o una function is_admin(). Nel nostro caso il backend viene sempre chiamato in server context,
-- quindi i permessi di scrittura possono essere gestiti applicativamente, ma aggiungiamo una policy ALL per service_role.
CREATE POLICY "rls_cms_admin" ON public.cms_landing_settings
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "rls_cms_gym_admin" ON public.cms_landing_settings
  FOR ALL
  USING (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), 'member') = 'gym_admin'
  )
  WITH CHECK (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), 'member') = 'gym_admin'
  );

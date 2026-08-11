# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-08-11
### Sicurezza
- **`rls_cms_gym_admin` filtra per tenant** (`cms_0002_tenant_isolation.sql`). Prima il predicato era il solo `role = 'gym_admin'`: un amministratore della palestra A poteva riscrivere banner, promozioni e contenuti della landing page della palestra B. Il controllo ora usa `is_gym_admin()`, che riconosce anche `super_admin` e ha il fallback sulla tabella profiles.
- Rimosso il `DEFAULT 'mythos'` da `tenant_id` e applicato `set_tenant_id_from_context()` (`cms_0003_tenant_autofill.sql`).
- FK `cms_landing_settings.tenant_id -> tenants(id)`.

## [1.1.0] - 2026-08-11
### Cambiato
- Migrazione consolidata in `cms_0001_baseline.sql`, con prefisso a namespace `cms_`. Il file precedente (`016_cms_schema.sql`, numerato contro la sequenza di un'applicazione client anziché la propria) è in `supabase/migrations/_archive/`.
- `@supabase/supabase-js` allineato a 2.112.2 con gli altri pacchetti e con l'app client.

## [1.0.0] - 2026-08-08
### Added
- Initial release of `@agency/core-cms`.
- Added `cms_landing_settings` table schema.
- Added `getLandingSettings` and `updateLandingSettings` functions to `backend` export.

# Changelog

All notable changes to this project will be documented in this file.

## [Non rilasciato]
### Aggiunto — consenso cookie (`@agency/core-cms/consent`)
Componenti riusabili da ogni sito cliente, con stili in linea e nessuna dipendenza da Tailwind o da un tema: si adattano passando `theme`, e funzionano identici in un progetto con un impianto grafico diverso.

- **`ConsentGate`** è il pezzo che conta. Non monta i figli finché la categoria non è stata accettata, quindi l'iframe di terze parti non esiste nel DOM e al fornitore non parte alcuna richiesta. Un banner che informa mentre la mappa ha già caricato non serve a nulla: i cookie sono già stati depositati. Offre anche un'alternativa che non richiede consenso (`fallbackHref`), così chi rifiuta non resta senza informazione.
- **`CookieBanner`**: se non si dichiara alcuna categoria facoltativa, non compare affatto. Chiedere il permesso per cose che non si fanno abitua le persone a cliccare "accetta" senza leggere. "Rifiuta" ha lo stesso peso visivo di "Accetta", non è nascosto dietro un secondo click.
- **`useConsent` / `openConsentPreferences` / `revokeConsent`**: la scelta è revocabile con la stessa facilità con cui è stata data. La decisione è salvata con data e versione dell'informativa; se cambiano le categorie in uso si alza `version` e il consenso viene richiesto di nuovo, perché un sì dato per una mappa non copre l'arrivo di un pixel pubblicitario.
- Nessun cookie viene scritto: la decisione sta in `localStorage`, quindi anche il meccanismo del consenso non deposita nulla prima del consenso.
- Predisposte le categorie `statistics` e `marketing` anche dove non servono ancora: aggiungere uno strumento sarà una voce in `categories`, non una riscrittura.

`react` aggiunto ai peer, `jsx` abilitato nel tsconfig: il pacchetto ora può contenere componenti oltre alle funzioni.

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

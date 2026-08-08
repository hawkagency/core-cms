# @agency/core-cms

Questo pacchetto contiene la logica di dominio per il Content Management System (CMS) dell'agenzia, con particolare focus sulla gestione delle impostazioni della Landing Page.

## Moduli Esportati
- `backend`: Funzioni server-side per interagire con Supabase (lettura/scrittura settaggi CMS).

## Tabella Database
Il pacchetto gestisce la tabella `cms_landing_settings` con supporto multi-tenant (colonna `tenant_id`).

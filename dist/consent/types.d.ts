/**
 * Categorie di cookie.
 *
 * `necessary` non è negoziabile e non compare come interruttore: sono i cookie
 * senza i quali il sito non funziona (la sessione di chi ha fatto accesso).
 * La normativa non richiede consenso per questi, richiede che siano davvero
 * necessari — quindi la categoria esiste per essere spiegata, non per essere
 * scelta.
 *
 * `statistics` e `marketing` sono predisposte anche quando il sito non le usa
 * ancora: aggiungere uno strumento domani sarà una voce in `categories`, non
 * una riscrittura del banner e un nuovo consenso da raccogliere da capo.
 */
export type ConsentCategory = 'necessary' | 'statistics' | 'marketing';
export interface ConsentDecision {
    statistics: boolean;
    marketing: boolean;
    /** Quando è stata presa la decisione. Serve come prova del consenso. */
    decidedAt: string;
    /**
     * Versione dell'informativa al momento della scelta. Se le categorie in uso
     * cambiano, la versione cambia e il consenso viene richiesto di nuovo:
     * un consenso dato per una mappa non copre l'arrivo di un pixel pubblicitario.
     */
    version: string;
}
export interface ConsentCategoryInfo {
    id: Exclude<ConsentCategory, 'necessary'>;
    label: string;
    description: string;
}
export interface CookieBannerTexts {
    title: string;
    body: string;
    acceptAll: string;
    rejectAll: string;
    customize: string;
    save: string;
    necessaryLabel: string;
    necessaryDescription: string;
    privacyLinkLabel: string;
}
export interface CookieBannerTheme {
    background: string;
    text: string;
    muted: string;
    accent: string;
    accentText: string;
    border: string;
    radius: string;
}

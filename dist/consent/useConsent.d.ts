import type { ConsentDecision } from './types';
/** Riapre le preferenze: da collegare a un link "Preferenze cookie" nel footer. */
export declare function openConsentPreferences(): void;
/**
 * Cancella la scelta fatta. Il consenso dev'essere revocabile con la stessa
 * facilità con cui è stato dato.
 */
export declare function revokeConsent(): void;
export interface UseConsentResult {
    decision: ConsentDecision | null;
    /**
     * `false` finché non si è letto il localStorage. Serve per non mostrare il
     * banner durante il primo render lato server, che produrrebbe un lampeggio
     * su ogni pagina anche a chi ha già scelto.
     */
    ready: boolean;
    /** La scelta esiste ed è aggiornata alla versione corrente dell'informativa. */
    hasDecided: boolean;
    allows: (category: 'statistics' | 'marketing') => boolean;
    save: (choice: {
        statistics: boolean;
        marketing: boolean;
    }) => void;
}
export declare function useConsent(version?: string): UseConsentResult;

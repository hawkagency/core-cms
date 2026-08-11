import type { ReactNode } from 'react';
import type { CookieBannerTheme } from './types';
export interface ConsentGateProps {
    category: 'statistics' | 'marketing';
    version?: string;
    children: ReactNode;
    /** Titolo del segnaposto, es. "Mappa Google". */
    title: string;
    /** Cosa succede accettando, in una riga. */
    description: string;
    buttonLabel?: string;
    /** Alternativa che non richiede consenso, es. "Apri in Google Maps". */
    fallbackHref?: string;
    fallbackLabel?: string;
    minHeight?: string;
    theme?: Partial<CookieBannerTheme>;
}
/**
 * Non monta i figli finché la categoria non è stata accettata.
 *
 * È il punto centrale di tutto il meccanismo: un banner che informa mentre la
 * mappa ha già caricato non serve a niente, perché i cookie di terze parti sono
 * già stati depositati. Qui l'iframe non esiste proprio nel DOM finché non c'è
 * un sì, quindi al fornitore non parte nemmeno una richiesta.
 */
export declare function ConsentGate({ category, version, children, title, description, buttonLabel, fallbackHref, fallbackLabel, minHeight, theme }: ConsentGateProps): import("react").JSX.Element;

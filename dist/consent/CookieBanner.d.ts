import type { ConsentCategoryInfo, CookieBannerTexts, CookieBannerTheme } from './types';
export interface CookieBannerProps {
    /**
     * Le categorie effettivamente in uso, oltre a quelle necessarie.
     *
     * Vuoto significa che il sito non usa nulla di facoltativo: in quel caso il
     * banner non compare affatto. Un banner che chiede il permesso per cose che
     * non fai è rumore, e abitua le persone a cliccare "accetta" senza leggere.
     */
    categories?: ConsentCategoryInfo[];
    /**
     * Cambiala quando cambiano le categorie in uso: il consenso viene richiesto
     * di nuovo. Un consenso dato per una mappa non copre l'arrivo di un pixel.
     */
    version?: string;
    privacyUrl?: string;
    texts?: Partial<CookieBannerTexts>;
    theme?: Partial<CookieBannerTheme>;
}
export declare function CookieBanner({ categories, version, privacyUrl, texts, theme }: CookieBannerProps): import("react").JSX.Element | null;

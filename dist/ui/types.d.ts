export interface DialogTheme {
    background: string;
    text: string;
    muted: string;
    accent: string;
    accentText: string;
    danger: string;
    dangerText: string;
    border: string;
    radius: string;
    overlay: string;
}
export type ConfirmTone = 'default' | 'danger';
export interface ConfirmRequest {
    /** Titolo breve: cosa sta per succedere. */
    title: string;
    /** Conseguenza, in una frase. Se l'azione è irreversibile, dirlo qui. */
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: ConfirmTone;
    /**
     * Parola che l'utente deve digitare per procedere.
     *
     * Da usare solo dove l'operazione non è annullabile: obbliga a leggere e
     * spezza il click automatico di chi conferma per riflesso. Metterla ovunque
     * la svuoterebbe di significato.
     */
    requireTyping?: string;
}

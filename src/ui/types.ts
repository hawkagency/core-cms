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

export interface PromptRequest {
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  /** Testo su più righe: per i motivi di rifiuto è quasi sempre quello che serve. */
  multiline?: boolean;
  /** Se true, non si può confermare a campo vuoto. Predefinito: true. */
  required?: boolean;
  initialValue?: string;
}

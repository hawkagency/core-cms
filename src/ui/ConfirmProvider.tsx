'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { ConfirmRequest, PromptRequest, DialogTheme } from './types';

/**
 * Sostituisce `window.confirm()` e `window.prompt()`.
 *
 * Non è una questione di estetica. Bloccano il thread principale, mostrano una
 * riga di testo senza formattazione e pulsanti di sistema che non si possono
 * nemmeno tradurre, e in una web app installata su iOS a volte non compaiono
 * affatto: l'utente tocca "elimina", non succede niente, e riprova. Soprattutto
 * non distinguono "salvo le modifiche?" da "elimino per sempre questo piano".
 *
 * L'API resta però quella a cui il codice esistente è abituato — si attende una
 * risposta, booleana o testuale — così ogni punto di chiamata cambia di una
 * riga invece di richiedere una riscrittura del flusso.
 */

type Richiesta =
  | ({ tipo: 'confirm' } & ConfirmRequest)
  | ({ tipo: 'prompt' } & PromptRequest);

interface Api {
  confirm: (req: ConfirmRequest) => Promise<boolean>;
  /** Restituisce il testo inserito, oppure `null` se si annulla. */
  prompt: (req: PromptRequest) => Promise<string | null>;
}

const ConfirmContext = createContext<Api | null>(null);

function useApi(): Api {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm/usePrompt richiedono <ConfirmProvider> più in alto nell\'albero.');
  }
  return ctx;
}

export function useConfirm() {
  return useApi().confirm;
}

export function usePrompt() {
  return useApi().prompt;
}

export interface ConfirmProviderProps {
  children: ReactNode;
  theme?: Partial<DialogTheme>;
}

export function ConfirmProvider({ children, theme }: ConfirmProviderProps) {
  const [richiesta, setRichiesta] = useState<Richiesta | null>(null);
  const [testo, setTesto] = useState('');
  const risolutore = useRef<((esito: boolean | string | null) => void) | null>(null);
  const campo = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const pulsanteAnnulla = useRef<HTMLButtonElement | null>(null);

  const apri = useCallback((req: Richiesta, iniziale: string) => {
    setTesto(iniziale);
    setRichiesta(req);
    return new Promise<boolean | string | null>((resolve) => {
      risolutore.current = resolve;
    });
  }, []);

  const confirm = useCallback(
    (req: ConfirmRequest) => apri({ tipo: 'confirm', ...req }, '') as Promise<boolean>,
    [apri]
  );

  const prompt = useCallback(
    (req: PromptRequest) =>
      apri({ tipo: 'prompt', ...req }, req.initialValue ?? '') as Promise<string | null>,
    [apri]
  );

  const chiudi = useCallback((esito: boolean | string | null) => {
    risolutore.current?.(esito);
    risolutore.current = null;
    setRichiesta(null);
    setTesto('');
  }, []);

  const annulla = useCallback(() => {
    // Un `confirm` annullato vale `false`, un `prompt` annullato vale `null`:
    // è la distinzione che permette a chi chiama di non trattare "ho scritto
    // una stringa vuota" come "ho rinunciato".
    chiudi(richiesta?.tipo === 'prompt' ? null : false);
  }, [chiudi, richiesta]);

  useEffect(() => {
    if (!richiesta) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') annulla();
    };
    window.addEventListener('keydown', onKey);
    // Il fuoco entra nel dialogo, altrimenti chi naviga da tastiera o con uno
    // screen reader resta sulla pagina sottostante e non sa che gli è stato
    // chiesto qualcosa.
    (campo.current ?? pulsanteAnnulla.current)?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [richiesta, annulla]);

  const c: DialogTheme = {
    background: '#ffffff',
    text: '#111827',
    muted: '#6b7280',
    accent: '#111827',
    accentText: '#ffffff',
    danger: '#b91c1c',
    dangerText: '#ffffff',
    border: '#e5e7eb',
    radius: '18px',
    overlay: 'rgba(15, 23, 42, 0.55)',
    ...theme,
  };

  const pericoloso = richiesta?.tone === 'danger';
  const parola = richiesta?.tipo === 'confirm' ? richiesta.requireTyping : undefined;
  const obbligatorio = richiesta?.tipo === 'prompt' ? richiesta.required !== false : false;

  const bloccato = parola
    ? testo.trim().toLowerCase() !== parola.trim().toLowerCase()
    : obbligatorio && testo.trim().length === 0;

  const conferma = () => {
    if (bloccato) return;
    chiudi(richiesta?.tipo === 'prompt' ? testo.trim() : true);
  };

  const stileCampo = {
    width: '100%',
    marginTop: '6px',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    borderRadius: '10px',
    border: `1px solid ${c.border}`,
    background: '#fff',
    color: c.text,
    boxSizing: 'border-box' as const,
  };

  return (
    <ConfirmContext.Provider value={{ confirm, prompt }}>
      {children}
      {richiesta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hawk-confirm-title"
          onMouseDown={(e) => {
            // Solo un click iniziato sullo sfondo annulla: un trascinamento
            // partito dentro il dialogo non deve chiuderlo per sbaglio.
            if (e.target === e.currentTarget) annulla();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2147483000,
            background: c.overlay,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              conferma();
            }}
            style={{
              width: '100%',
              maxWidth: '440px',
              background: c.background,
              color: c.text,
              borderRadius: c.radius,
              padding: '26px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
              fontFamily: 'inherit',
            }}
          >
            <h2 id="hawk-confirm-title" style={{ margin: 0, fontSize: '18px', fontWeight: 800, lineHeight: 1.3 }}>
              {richiesta.title}
            </h2>

            {richiesta.description && (
              <p style={{ margin: '10px 0 0', fontSize: '14px', lineHeight: 1.6, color: c.muted }}>
                {richiesta.description}
              </p>
            )}

            {richiesta.tipo === 'prompt' && (
              <label style={{ display: 'block', marginTop: '18px', fontSize: '13px', color: c.muted }}>
                {richiesta.label || 'Motivo'}
                {richiesta.multiline ? (
                  <textarea
                    ref={(el) => { campo.current = el; }}
                    value={testo}
                    onChange={(e) => setTesto(e.target.value)}
                    placeholder={richiesta.placeholder}
                    rows={3}
                    style={{ ...stileCampo, resize: 'vertical' }}
                  />
                ) : (
                  <input
                    ref={(el) => { campo.current = el; }}
                    value={testo}
                    onChange={(e) => setTesto(e.target.value)}
                    placeholder={richiesta.placeholder}
                    autoComplete="off"
                    style={stileCampo}
                  />
                )}
              </label>
            )}

            {parola && (
              <label style={{ display: 'block', marginTop: '18px', fontSize: '13px', color: c.muted }}>
                Per procedere scrivi <strong style={{ color: c.text }}>{parola}</strong>
                <input
                  ref={(el) => { campo.current = el; }}
                  value={testo}
                  onChange={(e) => setTesto(e.target.value)}
                  autoComplete="off"
                  style={stileCampo}
                />
              </label>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px', flexWrap: 'wrap' }}>
              <button
                type="button"
                ref={pulsanteAnnulla}
                onClick={annulla}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  border: `1px solid ${c.border}`,
                  background: 'transparent',
                  color: c.text,
                }}
              >
                {richiesta.cancelLabel || 'Annulla'}
              </button>
              <button
                type="submit"
                disabled={bloccato}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 800,
                  fontFamily: 'inherit',
                  cursor: bloccato ? 'not-allowed' : 'pointer',
                  opacity: bloccato ? 0.45 : 1,
                  border: `1px solid ${pericoloso ? c.danger : c.accent}`,
                  background: pericoloso ? c.danger : c.accent,
                  color: pericoloso ? c.dangerText : c.accentText,
                }}
              >
                {richiesta.confirmLabel || 'Conferma'}
              </button>
            </div>
          </form>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

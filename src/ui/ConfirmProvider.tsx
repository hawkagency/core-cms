'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { ConfirmRequest, DialogTheme } from './types';

/**
 * Sostituisce `window.confirm()`.
 *
 * Non è una questione di estetica. `confirm()` blocca il thread principale,
 * non si può tradurre né spiegare (mostra solo una riga di testo e due
 * pulsanti di sistema), e in una web app installata su iOS a volte non compare
 * affatto: l'utente tocca "elimina", non succede niente, e riprova. Soprattutto
 * non distingue "salvo le modifiche?" da "elimino per sempre questo piano".
 *
 * L'API resta però quella a cui il codice esistente è abituato — si attende
 * una risposta booleana — così la sostituzione è una riga per punto di
 * chiamata e non una riscrittura del flusso.
 */

type Risolutore = (ok: boolean) => void;

const ConfirmContext = createContext<((req: ConfirmRequest) => Promise<boolean>) | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm richiede <ConfirmProvider> più in alto nell\'albero.');
  }
  return ctx;
}

export interface ConfirmProviderProps {
  children: ReactNode;
  theme?: Partial<DialogTheme>;
}

export function ConfirmProvider({ children, theme }: ConfirmProviderProps) {
  const [richiesta, setRichiesta] = useState<ConfirmRequest | null>(null);
  const [digitato, setDigitato] = useState('');
  const risolutore = useRef<Risolutore | null>(null);
  const primoElemento = useRef<HTMLButtonElement | HTMLInputElement | null>(null);

  const confirm = useCallback((req: ConfirmRequest) => {
    setDigitato('');
    setRichiesta(req);
    return new Promise<boolean>((resolve) => {
      risolutore.current = resolve;
    });
  }, []);

  const chiudi = useCallback((ok: boolean) => {
    risolutore.current?.(ok);
    risolutore.current = null;
    setRichiesta(null);
    setDigitato('');
  }, []);

  // Esc annulla. Senza, l'unico modo per uscire sarebbe centrare un pulsante:
  // `confirm()` questo lo faceva, e toglierlo sarebbe un passo indietro.
  useEffect(() => {
    if (!richiesta) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') chiudi(false);
    };
    window.addEventListener('keydown', onKey);
    // Il fuoco parte dentro il dialogo, altrimenti chi naviga da tastiera o con
    // uno screen reader resta sulla pagina sottostante e non sa che è stato
    // chiesto qualcosa.
    primoElemento.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [richiesta, chiudi]);

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
  const parola = richiesta?.requireTyping;
  const bloccato = !!parola && digitato.trim().toLowerCase() !== parola.trim().toLowerCase();

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {richiesta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hawk-confirm-title"
          onMouseDown={(e) => {
            // Solo un click sullo sfondo annulla: un trascinamento partito
            // dentro il dialogo non deve chiuderlo per sbaglio.
            if (e.target === e.currentTarget) chiudi(false);
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
          <div
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

            {parola && (
              <label style={{ display: 'block', marginTop: '18px', fontSize: '13px', color: c.muted }}>
                Per procedere scrivi <strong style={{ color: c.text }}>{parola}</strong>
                <input
                  ref={(el) => { if (el) primoElemento.current = el; }}
                  value={digitato}
                  onChange={(e) => setDigitato(e.target.value)}
                  autoComplete="off"
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '10px 12px',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: `1px solid ${c.border}`,
                    background: '#fff',
                    color: c.text,
                  }}
                />
              </label>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px', flexWrap: 'wrap' }}>
              <button
                type="button"
                ref={(el) => { if (el && !parola) primoElemento.current = el; }}
                onClick={() => chiudi(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: `1px solid ${c.border}`,
                  background: 'transparent',
                  color: c.text,
                }}
              >
                {richiesta.cancelLabel || 'Annulla'}
              </button>
              <button
                type="button"
                onClick={() => chiudi(true)}
                disabled={bloccato}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 800,
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
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

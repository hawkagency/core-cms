'use client';

import type { ReactNode } from 'react';
import { useConsent } from './useConsent';
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
export function ConsentGate({
  category,
  version = '1',
  children,
  title,
  description,
  buttonLabel = 'Mostra contenuto',
  fallbackHref,
  fallbackLabel,
  minHeight = '320px',
  theme
}: ConsentGateProps) {
  const { ready, allows, save, decision } = useConsent(version);

  if (!ready) {
    return <div style={{ minHeight }} aria-hidden />;
  }

  if (allows(category)) {
    return <>{children}</>;
  }

  const c = {
    background: '#f9fafb',
    text: '#111827',
    muted: '#6b7280',
    accent: '#111827',
    accentText: '#ffffff',
    border: '#e5e7eb',
    radius: '16px',
    ...theme
  };

  return (
    <div
      style={{
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '10px',
        padding: '28px',
        background: c.background,
        border: `1px dashed ${c.border}`,
        borderRadius: c.radius,
        color: c.text
      }}
    >
      <strong style={{ fontSize: '15px' }}>{title}</strong>
      <p style={{ fontSize: '13px', color: c.muted, margin: 0, maxWidth: '42ch', lineHeight: 1.55 }}>
        {description}
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
        <button
          type="button"
          onClick={() =>
            save({
              statistics: category === 'statistics' ? true : !!decision?.statistics,
              marketing: category === 'marketing' ? true : !!decision?.marketing
            })
          }
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            border: `1px solid ${c.accent}`,
            background: c.accent,
            color: c.accentText
          }}
        >
          {buttonLabel}
        </button>
        {fallbackHref && (
          <a
            href={fallbackHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              border: `1px solid ${c.border}`,
              color: c.text,
              textDecoration: 'none'
            }}
          >
            {fallbackLabel || 'Apri in una nuova scheda'}
          </a>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useConsent } from './useConsent';
import type { ConsentCategoryInfo, CookieBannerTexts, CookieBannerTheme } from './types';

const DEFAULT_TEXTS: CookieBannerTexts = {
  title: 'Questo sito usa i cookie',
  body:
    'Usiamo cookie tecnici per farti restare collegato: senza quelli il sito non funziona. Per tutto il resto decidi tu, e puoi cambiare idea quando vuoi.',
  acceptAll: 'Accetta tutti',
  rejectAll: 'Rifiuta',
  customize: 'Personalizza',
  save: 'Salva le scelte',
  necessaryLabel: 'Necessari',
  necessaryDescription:
    'Tengono attivo il tuo accesso e ricordano questa scelta. Non si possono disattivare perché senza di loro il sito non funziona.',
  privacyLinkLabel: 'Informativa privacy'
};

const DEFAULT_THEME: CookieBannerTheme = {
  background: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  accent: '#111827',
  accentText: '#ffffff',
  border: '#e5e7eb',
  radius: '16px'
};

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

export function CookieBanner({
  categories = [],
  version = '1',
  privacyUrl = '/privacy',
  texts,
  theme
}: CookieBannerProps) {
  const t = { ...DEFAULT_TEXTS, ...texts };
  const c = { ...DEFAULT_THEME, ...theme };

  const { ready, hasDecided, decision, save } = useConsent(version);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState({ statistics: false, marketing: false });

  useEffect(() => {
    const reopen = () => {
      setDraft({
        statistics: !!decision?.statistics,
        marketing: !!decision?.marketing
      });
      setExpanded(true);
      setOpen(true);
    };
    window.addEventListener('hawk:consent-open', reopen);
    return () => window.removeEventListener('hawk:consent-open', reopen);
  }, [decision]);

  useEffect(() => {
    if (ready && !hasDecided && categories.length > 0) setOpen(true);
  }, [ready, hasDecided, categories.length]);

  if (categories.length === 0) return null;
  if (!open) return null;

  const decide = (value: boolean) => {
    save({ statistics: value, marketing: value });
    setOpen(false);
    setExpanded(false);
  };

  const btnBase: React.CSSProperties = {
    padding: '10px 18px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    border: `1px solid ${c.border}`,
    lineHeight: 1.2
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t.title}
      style={{
        position: 'fixed',
        left: '16px',
        right: '16px',
        bottom: '16px',
        zIndex: 9999,
        maxWidth: '560px',
        margin: '0 auto',
        background: c.background,
        color: c.text,
        border: `1px solid ${c.border}`,
        borderRadius: c.radius,
        boxShadow: '0 12px 40px rgba(0,0,0,.18)',
        padding: '20px',
        fontFamily: 'inherit'
      }}
    >
      <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>{t.title}</div>
      <p style={{ fontSize: '14px', lineHeight: 1.55, color: c.muted, margin: '0 0 14px' }}>
        {t.body}{' '}
        <a href={privacyUrl} style={{ color: c.text, textDecoration: 'underline' }}>
          {t.privacyLinkLabel}
        </a>
        .
      </p>

      {expanded && (
        <div style={{ margin: '0 0 16px' }}>
          <div
            style={{
              border: `1px solid ${c.border}`,
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '8px',
              opacity: 0.7
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <strong style={{ fontSize: '14px' }}>{t.necessaryLabel}</strong>
              <span style={{ fontSize: '12px', color: c.muted, whiteSpace: 'nowrap' }}>
                Sempre attivi
              </span>
            </div>
            <p style={{ fontSize: '13px', color: c.muted, margin: '6px 0 0', lineHeight: 1.5 }}>
              {t.necessaryDescription}
            </p>
          </div>

          {categories.map((cat) => (
            <label
              key={cat.id}
              style={{
                display: 'block',
                border: `1px solid ${c.border}`,
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '8px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <strong style={{ fontSize: '14px' }}>{cat.label}</strong>
                <input
                  type="checkbox"
                  checked={draft[cat.id]}
                  onChange={(e) => setDraft((d) => ({ ...d, [cat.id]: e.target.checked }))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              <p style={{ fontSize: '13px', color: c.muted, margin: '6px 0 0', lineHeight: 1.5 }}>
                {cat.description}
              </p>
            </label>
          ))}
        </div>
      )}

      {/*
        "Rifiuta" ha lo stesso peso visivo di "Accetta". Un rifiuto nascosto
        dietro due click o reso grigio non produce un consenso libero, ed è il
        motivo per cui molti banner sono stati contestati.
      */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {expanded ? (
          <button
            type="button"
            onClick={() => {
              save(draft);
              setOpen(false);
              setExpanded(false);
            }}
            style={{ ...btnBase, background: c.accent, color: c.accentText, borderColor: c.accent }}
          >
            {t.save}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            style={{ ...btnBase, background: 'transparent', color: c.text }}
          >
            {t.customize}
          </button>
        )}

        <button
          type="button"
          onClick={() => decide(false)}
          style={{ ...btnBase, background: 'transparent', color: c.text }}
        >
          {t.rejectAll}
        </button>

        <button
          type="button"
          onClick={() => decide(true)}
          style={{
            ...btnBase,
            background: c.accent,
            color: c.accentText,
            borderColor: c.accent,
            marginLeft: 'auto'
          }}
        >
          {t.acceptAll}
        </button>
      </div>
    </div>
  );
}

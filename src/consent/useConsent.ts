'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ConsentDecision } from './types';

const STORAGE_KEY = 'hawk_cookie_consent';

/**
 * Evento interno: quando una scheda cambia il consenso, tutti i componenti
 * montati devono accorgersene subito. `storage` non basta perché non scatta
 * nella scheda che ha scritto.
 */
const CONSENT_EVENT = 'hawk:consent-changed';

function read(): ConsentDecision | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentDecision;
    if (typeof parsed?.statistics !== 'boolean') return null;
    return parsed;
  } catch {
    return null;
  }
}

function write(decision: ConsentDecision) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(decision));
  } catch {
    /* modalità privata con storage disabilitato: il banner riapparirà */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
}

/** Riapre le preferenze: da collegare a un link "Preferenze cookie" nel footer. */
export function openConsentPreferences() {
  window.dispatchEvent(new CustomEvent('hawk:consent-open'));
}

/**
 * Cancella la scelta fatta. Il consenso dev'essere revocabile con la stessa
 * facilità con cui è stato dato.
 */
export function revokeConsent() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* niente da fare */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
}

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
  save: (choice: { statistics: boolean; marketing: boolean }) => void;
}

export function useConsent(version = '1'): UseConsentResult {
  const [decision, setDecision] = useState<ConsentDecision | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setDecision(read());
    sync();
    setReady(true);
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const hasDecided = decision !== null && decision.version === version;

  const save = useCallback(
    (choice: { statistics: boolean; marketing: boolean }) => {
      write({ ...choice, decidedAt: new Date().toISOString(), version });
    },
    [version]
  );

  const allows = useCallback(
    (category: 'statistics' | 'marketing') => (hasDecided ? !!decision?.[category] : false),
    [decision, hasDecided]
  );

  return { decision, ready, hasDecided, allows, save };
}

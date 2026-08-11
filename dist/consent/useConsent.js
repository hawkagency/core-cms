'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openConsentPreferences = openConsentPreferences;
exports.revokeConsent = revokeConsent;
exports.useConsent = useConsent;
const react_1 = require("react");
const STORAGE_KEY = 'hawk_cookie_consent';
/**
 * Evento interno: quando una scheda cambia il consenso, tutti i componenti
 * montati devono accorgersene subito. `storage` non basta perché non scatta
 * nella scheda che ha scritto.
 */
const CONSENT_EVENT = 'hawk:consent-changed';
function read() {
    if (typeof window === 'undefined')
        return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed?.statistics !== 'boolean')
            return null;
        return parsed;
    }
    catch {
        return null;
    }
}
function write(decision) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(decision));
    }
    catch {
        /* modalità privata con storage disabilitato: il banner riapparirà */
    }
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
}
/** Riapre le preferenze: da collegare a un link "Preferenze cookie" nel footer. */
function openConsentPreferences() {
    window.dispatchEvent(new CustomEvent('hawk:consent-open'));
}
/**
 * Cancella la scelta fatta. Il consenso dev'essere revocabile con la stessa
 * facilità con cui è stato dato.
 */
function revokeConsent() {
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    }
    catch {
        /* niente da fare */
    }
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
}
function useConsent(version = '1') {
    const [decision, setDecision] = (0, react_1.useState)(null);
    const [ready, setReady] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
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
    const save = (0, react_1.useCallback)((choice) => {
        write({ ...choice, decidedAt: new Date().toISOString(), version });
    }, [version]);
    const allows = (0, react_1.useCallback)((category) => (hasDecided ? !!decision?.[category] : false), [decision, hasDecided]);
    return { decision, ready, hasDecided, allows, save };
}

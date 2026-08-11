'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentGate = ConsentGate;
const jsx_runtime_1 = require("react/jsx-runtime");
const useConsent_1 = require("./useConsent");
/**
 * Non monta i figli finché la categoria non è stata accettata.
 *
 * È il punto centrale di tutto il meccanismo: un banner che informa mentre la
 * mappa ha già caricato non serve a niente, perché i cookie di terze parti sono
 * già stati depositati. Qui l'iframe non esiste proprio nel DOM finché non c'è
 * un sì, quindi al fornitore non parte nemmeno una richiesta.
 */
function ConsentGate({ category, version = '1', children, title, description, buttonLabel = 'Mostra contenuto', fallbackHref, fallbackLabel, minHeight = '320px', theme }) {
    const { ready, allows, save, decision } = (0, useConsent_1.useConsent)(version);
    if (!ready) {
        return (0, jsx_runtime_1.jsx)("div", { style: { minHeight }, "aria-hidden": true });
    }
    if (allows(category)) {
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children });
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
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
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
        }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { fontSize: '15px' }, children: title }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '13px', color: c.muted, margin: 0, maxWidth: '42ch', lineHeight: 1.55 }, children: description }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => save({
                            statistics: category === 'statistics' ? true : !!decision?.statistics,
                            marketing: category === 'marketing' ? true : !!decision?.marketing
                        }), style: {
                            padding: '10px 18px',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: `1px solid ${c.accent}`,
                            background: c.accent,
                            color: c.accentText
                        }, children: buttonLabel }), fallbackHref && ((0, jsx_runtime_1.jsx)("a", { href: fallbackHref, target: "_blank", rel: "noopener noreferrer", style: {
                            padding: '10px 18px',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 700,
                            border: `1px solid ${c.border}`,
                            color: c.text,
                            textDecoration: 'none'
                        }, children: fallbackLabel || 'Apri in una nuova scheda' }))] })] }));
}

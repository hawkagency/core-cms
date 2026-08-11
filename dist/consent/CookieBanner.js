'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieBanner = CookieBanner;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useConsent_1 = require("./useConsent");
const DEFAULT_TEXTS = {
    title: 'Questo sito usa i cookie',
    body: 'Usiamo cookie tecnici per farti restare collegato: senza quelli il sito non funziona. Per tutto il resto decidi tu, e puoi cambiare idea quando vuoi.',
    acceptAll: 'Accetta tutti',
    rejectAll: 'Rifiuta',
    customize: 'Personalizza',
    save: 'Salva le scelte',
    necessaryLabel: 'Necessari',
    necessaryDescription: 'Tengono attivo il tuo accesso e ricordano questa scelta. Non si possono disattivare perché senza di loro il sito non funziona.',
    privacyLinkLabel: 'Informativa privacy'
};
const DEFAULT_THEME = {
    background: '#ffffff',
    text: '#111827',
    muted: '#6b7280',
    accent: '#111827',
    accentText: '#ffffff',
    border: '#e5e7eb',
    radius: '16px'
};
function CookieBanner({ categories = [], version = '1', privacyUrl = '/privacy', texts, theme }) {
    const t = { ...DEFAULT_TEXTS, ...texts };
    const c = { ...DEFAULT_THEME, ...theme };
    const { ready, hasDecided, decision, save } = (0, useConsent_1.useConsent)(version);
    const [open, setOpen] = (0, react_1.useState)(false);
    const [expanded, setExpanded] = (0, react_1.useState)(false);
    const [draft, setDraft] = (0, react_1.useState)({ statistics: false, marketing: false });
    (0, react_1.useEffect)(() => {
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
    (0, react_1.useEffect)(() => {
        if (ready && !hasDecided && categories.length > 0)
            setOpen(true);
    }, [ready, hasDecided, categories.length]);
    if (categories.length === 0)
        return null;
    if (!open)
        return null;
    const decide = (value) => {
        save({ statistics: value, marketing: value });
        setOpen(false);
        setExpanded(false);
    };
    const btnBase = {
        padding: '10px 18px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 700,
        cursor: 'pointer',
        border: `1px solid ${c.border}`,
        lineHeight: 1.2
    };
    return ((0, jsx_runtime_1.jsxs)("div", { role: "dialog", "aria-modal": "false", "aria-label": t.title, style: {
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
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '16px', fontWeight: 800, marginBottom: '8px' }, children: t.title }), (0, jsx_runtime_1.jsxs)("p", { style: { fontSize: '14px', lineHeight: 1.55, color: c.muted, margin: '0 0 14px' }, children: [t.body, ' ', (0, jsx_runtime_1.jsx)("a", { href: privacyUrl, style: { color: c.text, textDecoration: 'underline' }, children: t.privacyLinkLabel }), "."] }), expanded && ((0, jsx_runtime_1.jsxs)("div", { style: { margin: '0 0 16px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                            border: `1px solid ${c.border}`,
                            borderRadius: '10px',
                            padding: '12px',
                            marginBottom: '8px',
                            opacity: 0.7
                        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', gap: '12px' }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { fontSize: '14px' }, children: t.necessaryLabel }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: '12px', color: c.muted, whiteSpace: 'nowrap' }, children: "Sempre attivi" })] }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '13px', color: c.muted, margin: '6px 0 0', lineHeight: 1.5 }, children: t.necessaryDescription })] }), categories.map((cat) => ((0, jsx_runtime_1.jsxs)("label", { style: {
                            display: 'block',
                            border: `1px solid ${c.border}`,
                            borderRadius: '10px',
                            padding: '12px',
                            marginBottom: '8px',
                            cursor: 'pointer'
                        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', gap: '12px' }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { fontSize: '14px' }, children: cat.label }), (0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: draft[cat.id], onChange: (e) => setDraft((d) => ({ ...d, [cat.id]: e.target.checked })), style: { width: '18px', height: '18px', cursor: 'pointer' } })] }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '13px', color: c.muted, margin: '6px 0 0', lineHeight: 1.5 }, children: cat.description })] }, cat.id)))] })), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' }, children: [expanded ? ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                            save(draft);
                            setOpen(false);
                            setExpanded(false);
                        }, style: { ...btnBase, background: c.accent, color: c.accentText, borderColor: c.accent }, children: t.save })) : ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setExpanded(true), style: { ...btnBase, background: 'transparent', color: c.text }, children: t.customize })), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => decide(false), style: { ...btnBase, background: 'transparent', color: c.text }, children: t.rejectAll }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => decide(true), style: {
                            ...btnBase,
                            background: c.accent,
                            color: c.accentText,
                            borderColor: c.accent,
                            marginLeft: 'auto'
                        }, children: t.acceptAll })] })] }));
}

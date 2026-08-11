'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useConfirm = useConfirm;
exports.ConfirmProvider = ConfirmProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ConfirmContext = (0, react_1.createContext)(null);
function useConfirm() {
    const ctx = (0, react_1.useContext)(ConfirmContext);
    if (!ctx) {
        throw new Error('useConfirm richiede <ConfirmProvider> più in alto nell\'albero.');
    }
    return ctx;
}
function ConfirmProvider({ children, theme }) {
    const [richiesta, setRichiesta] = (0, react_1.useState)(null);
    const [digitato, setDigitato] = (0, react_1.useState)('');
    const risolutore = (0, react_1.useRef)(null);
    const primoElemento = (0, react_1.useRef)(null);
    const confirm = (0, react_1.useCallback)((req) => {
        setDigitato('');
        setRichiesta(req);
        return new Promise((resolve) => {
            risolutore.current = resolve;
        });
    }, []);
    const chiudi = (0, react_1.useCallback)((ok) => {
        risolutore.current?.(ok);
        risolutore.current = null;
        setRichiesta(null);
        setDigitato('');
    }, []);
    // Esc annulla. Senza, l'unico modo per uscire sarebbe centrare un pulsante:
    // `confirm()` questo lo faceva, e toglierlo sarebbe un passo indietro.
    (0, react_1.useEffect)(() => {
        if (!richiesta)
            return;
        const onKey = (e) => {
            if (e.key === 'Escape')
                chiudi(false);
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
    const c = {
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
    return ((0, jsx_runtime_1.jsxs)(ConfirmContext.Provider, { value: confirm, children: [children, richiesta && ((0, jsx_runtime_1.jsx)("div", { role: "dialog", "aria-modal": "true", "aria-labelledby": "hawk-confirm-title", onMouseDown: (e) => {
                    // Solo un click sullo sfondo annulla: un trascinamento partito
                    // dentro il dialogo non deve chiuderlo per sbaglio.
                    if (e.target === e.currentTarget)
                        chiudi(false);
                }, style: {
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2147483000,
                    background: c.overlay,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                        width: '100%',
                        maxWidth: '440px',
                        background: c.background,
                        color: c.text,
                        borderRadius: c.radius,
                        padding: '26px',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
                        fontFamily: 'inherit',
                    }, children: [(0, jsx_runtime_1.jsx)("h2", { id: "hawk-confirm-title", style: { margin: 0, fontSize: '18px', fontWeight: 800, lineHeight: 1.3 }, children: richiesta.title }), richiesta.description && ((0, jsx_runtime_1.jsx)("p", { style: { margin: '10px 0 0', fontSize: '14px', lineHeight: 1.6, color: c.muted }, children: richiesta.description })), parola && ((0, jsx_runtime_1.jsxs)("label", { style: { display: 'block', marginTop: '18px', fontSize: '13px', color: c.muted }, children: ["Per procedere scrivi ", (0, jsx_runtime_1.jsx)("strong", { style: { color: c.text }, children: parola }), (0, jsx_runtime_1.jsx)("input", { ref: (el) => { if (el)
                                        primoElemento.current = el; }, value: digitato, onChange: (e) => setDigitato(e.target.value), autoComplete: "off", style: {
                                        width: '100%',
                                        marginTop: '6px',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        borderRadius: '10px',
                                        border: `1px solid ${c.border}`,
                                        background: '#fff',
                                        color: c.text,
                                    } })] })), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px', flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", ref: (el) => { if (el && !parola)
                                        primoElemento.current = el; }, onClick: () => chiudi(false), style: {
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        border: `1px solid ${c.border}`,
                                        background: 'transparent',
                                        color: c.text,
                                    }, children: richiesta.cancelLabel || 'Annulla' }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => chiudi(true), disabled: bloccato, style: {
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: 800,
                                        cursor: bloccato ? 'not-allowed' : 'pointer',
                                        opacity: bloccato ? 0.45 : 1,
                                        border: `1px solid ${pericoloso ? c.danger : c.accent}`,
                                        background: pericoloso ? c.danger : c.accent,
                                        color: pericoloso ? c.dangerText : c.accentText,
                                    }, children: richiesta.confirmLabel || 'Conferma' })] })] }) }))] }));
}

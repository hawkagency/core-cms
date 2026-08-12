'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useConfirm = useConfirm;
exports.usePrompt = usePrompt;
exports.ConfirmProvider = ConfirmProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ConfirmContext = (0, react_1.createContext)(null);
function useApi() {
    const ctx = (0, react_1.useContext)(ConfirmContext);
    if (!ctx) {
        throw new Error('useConfirm/usePrompt richiedono <ConfirmProvider> più in alto nell\'albero.');
    }
    return ctx;
}
function useConfirm() {
    return useApi().confirm;
}
function usePrompt() {
    return useApi().prompt;
}
function ConfirmProvider({ children, theme }) {
    const [richiesta, setRichiesta] = (0, react_1.useState)(null);
    const [testo, setTesto] = (0, react_1.useState)('');
    const risolutore = (0, react_1.useRef)(null);
    const campo = (0, react_1.useRef)(null);
    const pulsanteAnnulla = (0, react_1.useRef)(null);
    const apri = (0, react_1.useCallback)((req, iniziale) => {
        setTesto(iniziale);
        setRichiesta(req);
        return new Promise((resolve) => {
            risolutore.current = resolve;
        });
    }, []);
    const confirm = (0, react_1.useCallback)((req) => apri({ tipo: 'confirm', ...req }, ''), [apri]);
    const prompt = (0, react_1.useCallback)((req) => apri({ tipo: 'prompt', ...req }, req.initialValue ?? ''), [apri]);
    const chiudi = (0, react_1.useCallback)((esito) => {
        risolutore.current?.(esito);
        risolutore.current = null;
        setRichiesta(null);
        setTesto('');
    }, []);
    const annulla = (0, react_1.useCallback)(() => {
        // Un `confirm` annullato vale `false`, un `prompt` annullato vale `null`:
        // è la distinzione che permette a chi chiama di non trattare "ho scritto
        // una stringa vuota" come "ho rinunciato".
        chiudi(richiesta?.tipo === 'prompt' ? null : false);
    }, [chiudi, richiesta]);
    (0, react_1.useEffect)(() => {
        if (!richiesta)
            return;
        const onKey = (e) => {
            if (e.key === 'Escape')
                annulla();
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
    const parola = richiesta?.tipo === 'confirm' ? richiesta.requireTyping : undefined;
    const obbligatorio = richiesta?.tipo === 'prompt' ? richiesta.required !== false : false;
    const bloccato = parola
        ? testo.trim().toLowerCase() !== parola.trim().toLowerCase()
        : obbligatorio && testo.trim().length === 0;
    const conferma = () => {
        if (bloccato)
            return;
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
        boxSizing: 'border-box',
    };
    return ((0, jsx_runtime_1.jsxs)(ConfirmContext.Provider, { value: { confirm, prompt }, children: [children, richiesta && ((0, jsx_runtime_1.jsx)("div", { role: "dialog", "aria-modal": "true", "aria-labelledby": "hawk-confirm-title", onMouseDown: (e) => {
                    // Solo un click iniziato sullo sfondo annulla: un trascinamento
                    // partito dentro il dialogo non deve chiuderlo per sbaglio.
                    if (e.target === e.currentTarget)
                        annulla();
                }, style: {
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2147483000,
                    background: c.overlay,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                }, children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => {
                        e.preventDefault();
                        conferma();
                    }, style: {
                        width: '100%',
                        maxWidth: '440px',
                        background: c.background,
                        color: c.text,
                        borderRadius: c.radius,
                        padding: '26px',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
                        fontFamily: 'inherit',
                    }, children: [(0, jsx_runtime_1.jsx)("h2", { id: "hawk-confirm-title", style: { margin: 0, fontSize: '18px', fontWeight: 800, lineHeight: 1.3 }, children: richiesta.title }), richiesta.description && ((0, jsx_runtime_1.jsx)("p", { style: { margin: '10px 0 0', fontSize: '14px', lineHeight: 1.6, color: c.muted }, children: richiesta.description })), richiesta.tipo === 'prompt' && ((0, jsx_runtime_1.jsxs)("label", { style: { display: 'block', marginTop: '18px', fontSize: '13px', color: c.muted }, children: [richiesta.label || 'Motivo', richiesta.multiline ? ((0, jsx_runtime_1.jsx)("textarea", { ref: (el) => { campo.current = el; }, value: testo, onChange: (e) => setTesto(e.target.value), placeholder: richiesta.placeholder, rows: 3, style: { ...stileCampo, resize: 'vertical' } })) : ((0, jsx_runtime_1.jsx)("input", { ref: (el) => { campo.current = el; }, value: testo, onChange: (e) => setTesto(e.target.value), placeholder: richiesta.placeholder, autoComplete: "off", style: stileCampo }))] })), parola && ((0, jsx_runtime_1.jsxs)("label", { style: { display: 'block', marginTop: '18px', fontSize: '13px', color: c.muted }, children: ["Per procedere scrivi ", (0, jsx_runtime_1.jsx)("strong", { style: { color: c.text }, children: parola }), (0, jsx_runtime_1.jsx)("input", { ref: (el) => { campo.current = el; }, value: testo, onChange: (e) => setTesto(e.target.value), autoComplete: "off", style: stileCampo })] })), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px', flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", ref: pulsanteAnnulla, onClick: annulla, style: {
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        border: `1px solid ${c.border}`,
                                        background: 'transparent',
                                        color: c.text,
                                    }, children: richiesta.cancelLabel || 'Annulla' }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: bloccato, style: {
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
                                    }, children: richiesta.confirmLabel || 'Conferma' })] })] }) }))] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function SuggestionForm({ onSubmit }) {
    const [contactName, setContactName] = useState('');
    const [message, setMessage] = useState('');
    const [proposedContent, setProposedContent] = useState('');
    const [status, setStatus] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setStatus(null);
        try {
            await onSubmit({ contactName, message, proposedContent });
            setContactName('');
            setMessage('');
            setProposedContent('');
            setStatus('Suggestion submitted.');
        }
        catch (error) {
            setStatus(error instanceof Error ? error.message : 'Unable to submit suggestion.');
        }
        finally {
            setIsSaving(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-3 rounded-3xl border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-base font-semibold", children: "Suggest a correction" }), _jsx("p", { className: "mt-1 text-sm text-stone-600 dark:text-stone-300", children: "Use this if you spot a typo or wrong chord." })] }), _jsx("input", { value: contactName, onChange: (event) => setContactName(event.target.value), placeholder: "Your name (optional)", className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950" }), _jsx("textarea", { value: message, onChange: (event) => setMessage(event.target.value), placeholder: "What should be corrected?", rows: 3, className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950", required: true }), _jsx("textarea", { value: proposedContent, onChange: (event) => setProposedContent(event.target.value), placeholder: "Optional corrected chord block", rows: 6, className: "w-full rounded-2xl border border-stone-200 px-4 py-3 font-mono dark:border-stone-700 dark:bg-stone-950", required: true }), status ? _jsx("p", { className: "text-sm text-stone-600 dark:text-stone-300", children: status }) : null, _jsx("button", { type: "submit", disabled: isSaving, className: "rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60", children: isSaving ? 'Submitting...' : 'Submit correction' })] }));
}

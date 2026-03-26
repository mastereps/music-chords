import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function DeleteModal({ isOpen, title, message, onConfirm, onCancel }) {
    if (!isOpen) {
        return null;
    }
    return (_jsx("div", { className: "fixed inset-0 z-40 flex items-end bg-black/50 p-4 sm:items-center sm:justify-center", children: _jsxs("div", { className: "w-full max-w-md rounded-3xl bg-white p-5 shadow-panel dark:bg-stone-900", children: [_jsx("h3", { className: "text-lg font-semibold", children: title }), _jsx("p", { className: "mt-2 text-sm text-stone-600 dark:text-stone-300", children: message }), _jsxs("div", { className: "mt-5 flex gap-2", children: [_jsx("button", { type: "button", onClick: onCancel, className: "flex-1 rounded-2xl border border-stone-300 px-4 py-3 font-semibold dark:border-stone-700", children: "Cancel" }), _jsx("button", { type: "button", onClick: () => void onConfirm(), className: "flex-1 rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white", children: "Delete" })] })] }) }));
}

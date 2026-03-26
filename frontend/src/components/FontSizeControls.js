import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function FontSizeControls({ fontSize, onDecrease, onIncrease }) {
    return (_jsxs("div", { className: "flex flex-wrap items-center gap-2 text-sm", children: [_jsx("button", { type: "button", onClick: onDecrease, className: "rounded-2xl border border-stone-300 px-4 py-3 font-semibold dark:border-stone-700", children: "A-" }), _jsxs("span", { className: "rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold dark:bg-stone-800", children: [fontSize, "px"] }), _jsx("button", { type: "button", onClick: onIncrease, className: "rounded-2xl border border-stone-300 px-4 py-3 font-semibold dark:border-stone-700", children: "A+" })] }));
}

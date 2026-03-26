import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function TransposeControls({ offset, onDecrease, onIncrease, onReset }) {
    return (_jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { type: "button", onClick: onDecrease, className: "rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold dark:border-stone-700", children: "Transpose -" }), _jsx("button", { type: "button", onClick: onIncrease, className: "rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold dark:border-stone-700", children: "Transpose +" }), _jsxs("button", { type: "button", onClick: onReset, className: "rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold dark:border-stone-700", children: ["Reset (", offset, ")"] })] }));
}

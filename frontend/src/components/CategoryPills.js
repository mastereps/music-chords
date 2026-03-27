import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function CategoryPills({ items, activeCategoryId, onSelect }) {
    return (_jsxs("div", { className: "flex gap-2 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]", children: [_jsx("button", { type: "button", onClick: () => onSelect(undefined), className: `rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap ${!activeCategoryId
                    ? 'border-brand-700 bg-brand-700 text-white'
                    : 'border-stone-300 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200'}`, children: "All" }), items.map((category) => (_jsx("button", { type: "button", onClick: () => onSelect(category.id), className: `rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap ${activeCategoryId === category.id
                    ? 'border-brand-700 bg-brand-700 text-white'
                    : 'border-stone-300 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200'}`, children: category.name }, category.id)))] }));
}

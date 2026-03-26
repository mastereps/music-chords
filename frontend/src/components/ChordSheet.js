import { jsx as _jsx } from "react/jsx-runtime";
export function ChordSheet({ content, fontSize }) {
    return (_jsx("pre", { className: "overflow-x-auto rounded-[2rem] border border-stone-200 bg-white px-4 py-5 font-mono leading-[1.85] text-stone-950 shadow-panel dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50 sm:px-6", style: { fontSize: `${fontSize}px` }, children: content }));
}

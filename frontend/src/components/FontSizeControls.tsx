export function FontSizeControls({
  fontSize,
  onDecrease,
  onIncrease
}: {
  fontSize: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <button type="button" onClick={onDecrease} className="rounded-2xl border border-stone-300 px-4 py-3 font-semibold dark:border-stone-700">
        A-
      </button>
      <span className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold dark:bg-stone-800">{fontSize}px</span>
      <button type="button" onClick={onIncrease} className="rounded-2xl border border-stone-300 px-4 py-3 font-semibold dark:border-stone-700">
        A+
      </button>
    </div>
  );
}

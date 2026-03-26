export function TransposeControls({
  offset,
  onDecrease,
  onIncrease,
  onReset
}: {
  offset: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={onDecrease} className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold dark:border-stone-700">
        Transpose -
      </button>
      <button type="button" onClick={onIncrease} className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold dark:border-stone-700">
        Transpose +
      </button>
      <button type="button" onClick={onReset} className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold dark:border-stone-700">
        Reset ({offset})
      </button>
    </div>
  );
}

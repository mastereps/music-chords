interface SearchBarProps {
  value: string;
  onChange: (nextValue: string) => void;
  onClear: () => void;
  label?: string;
  placeholder?: string;
  sticky?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  label = 'Search songs',
  placeholder = 'Title, artist, tag, category',
  sticky = true
}: SearchBarProps) {
  return (
    <div
      className={`${sticky ? 'sticky top-20 z-20' : ''} w-full min-w-0 rounded-3xl border border-stone-200 bg-stone-50/95 p-3 shadow-panel backdrop-blur dark:border-stone-800 dark:bg-stone-900/95`}
    >
      <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-stone-400">{label}</label>
      <div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-12 min-w-0 w-full flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-500 dark:border-stone-700 dark:bg-stone-950"
        />
        <button
          type="button"
          onClick={onClear}
          className="min-h-12 w-full shrink-0 rounded-2xl border border-stone-300 px-4 text-sm font-semibold text-stone-700 dark:border-stone-700 dark:text-stone-200 sm:w-auto"
        >
          {value ? 'Clear' : 'Reset'}
        </button>
      </div>
    </div>
  );
}

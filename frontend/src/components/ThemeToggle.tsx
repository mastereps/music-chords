export function ThemeToggle({ theme, onToggle }: { theme: 'light' | 'dark'; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-full border border-stone-300 px-3 py-2 text-center text-xs font-semibold text-stone-700 transition hover:border-brand-500 hover:text-brand-700 dark:border-stone-700 dark:text-stone-200"
    >
      {theme === 'dark' ? 'Light' : 'Dark'} mode
    </button>
  );
}

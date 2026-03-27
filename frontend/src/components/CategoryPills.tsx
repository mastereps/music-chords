import type { Category } from '@music-chords/shared';

export function CategoryPills({
  items,
  activeCategoryId,
  onSelect
}: {
  items: Category[];
  activeCategoryId?: number;
  onSelect: (categoryId?: number) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]">
      <button
        type="button"
        onClick={() => onSelect(undefined)}
        className={`rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap ${
          !activeCategoryId
            ? 'border-brand-700 bg-brand-700 text-white'
            : 'border-stone-300 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200'
        }`}
      >
        All
      </button>
      {items.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={`rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap ${
            activeCategoryId === category.id
              ? 'border-brand-700 bg-brand-700 text-white'
              : 'border-stone-300 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}


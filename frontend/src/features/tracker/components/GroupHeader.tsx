import type { ItemKind } from '../trackerTypes';

interface GroupHeaderProps {
  kind: ItemKind;
  title: string;
  subtitle: string;
}

const KIND_ICONS: Record<ItemKind, string> = {
  skill: '📖',
  piece: '🎼',
  passage: '🎯'
};

export function GroupHeader({ kind, title, subtitle }: GroupHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-y border-studio-line/70 bg-studio-lavender px-4 py-2.5 first:border-t-0">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-studio-accent/15 text-sm ring-1 ring-studio-accent/20"
      >
        {KIND_ICONS[kind]}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-studio-accent">{title}</p>
        <p className="truncate text-xs text-studio-muted">{subtitle}</p>
      </div>
    </div>
  );
}

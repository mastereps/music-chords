import { ITEM_STATUSES, STATUS_LABELS, type ItemStatus } from '../trackerTypes';

interface StatusSelectProps {
  value: ItemStatus;
  onChange: (status: ItemStatus) => void;
  label: string;
  disabled?: boolean;
}

const STATUS_CLASSES: Record<ItemStatus, string> = {
  passed: 'bg-status-passed-soft text-status-passed ring-status-passed/25',
  lacking: 'bg-status-lacking-soft text-status-lacking ring-status-lacking/25',
  not_started: 'bg-status-not-started-soft text-status-not-started ring-status-not-started/20'
};

export function StatusSelect({ value, onChange, label, disabled = false }: StatusSelectProps) {
  return (
    <div className={`relative inline-flex items-center rounded-lg ring-1 ${STATUS_CLASSES[value]}`}>
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as ItemStatus)}
        className={`appearance-none bg-transparent py-1.5 pl-3 pr-8 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent/60 ${
          disabled ? 'cursor-default' : 'cursor-pointer'
        }`}
      >
        {ITEM_STATUSES.map((status) => (
          <option key={status} value={status} className="bg-studio-card text-studio-ink">
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      <svg aria-hidden="true" viewBox="0 0 20 20" className="pointer-events-none absolute right-2 h-3.5 w-3.5 fill-current opacity-70">
        <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

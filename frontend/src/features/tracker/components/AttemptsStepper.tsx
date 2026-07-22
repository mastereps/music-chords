interface AttemptsStepperProps {
  value: number;
  onChange: (attempts: number) => void;
  label: string;
  disabled?: boolean;
}

const BUTTON_CLASSES =
  'flex h-7 w-7 items-center justify-center rounded-md text-studio-muted transition hover:bg-studio-line hover:text-studio-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

export function AttemptsStepper({ value, onChange, label, disabled = false }: AttemptsStepperProps) {
  // Read-only viewers see the count without the chrome around it — nothing to press, nothing greyed out.
  if (disabled) {
    return (
      <span aria-label={label} className="inline-flex px-1 py-1 text-sm font-semibold tabular-nums text-studio-ink">
        {value}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-studio-line bg-studio-page px-1 py-0.5">
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= 0} onClick={() => onChange(value - 1)} className={BUTTON_CLASSES}>
        −
      </button>
      <span aria-label={label} className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums text-studio-ink">
        {value}
      </span>
      <button type="button" aria-label={`Increase ${label}`} onClick={() => onChange(value + 1)} className={BUTTON_CLASSES}>
        +
      </button>
    </div>
  );
}

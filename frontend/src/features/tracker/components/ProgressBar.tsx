interface ProgressBarProps {
  value: number;
  /** Accent colour for the filled portion, from the instrument registry. */
  color: string;
  className?: string;
}

export function ProgressBar({ value, color, className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-2 w-full overflow-hidden rounded-full bg-studio-line ${className}`}
    >
      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${clamped}%`, backgroundColor: color }} />
    </div>
  );
}

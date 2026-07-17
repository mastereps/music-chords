import { instrumentStyle, type Instrument } from '../instruments';

interface StudentAvatarProps {
  initials: string;
  instrument: Instrument;
  size?: 'sm' | 'lg';
}

const SIZES = {
  sm: { circle: 'h-16 w-16 text-xl', badge: 'h-6 w-6 text-[11px]' },
  lg: { circle: 'h-28 w-28 text-3xl', badge: 'h-9 w-9 text-base' }
};

export function StudentAvatar({ initials, instrument, size = 'lg' }: StudentAvatarProps) {
  const style = instrumentStyle(instrument);
  const dimensions = SIZES[size];

  return (
    <div className="relative shrink-0">
      <div
        style={{ backgroundColor: style.tint, color: style.color }}
        className={`flex items-center justify-center rounded-full font-display font-semibold ring-4 ring-white ${dimensions.circle}`}
      >
        {initials}
      </div>
      <span
        aria-hidden="true"
        style={{ boxShadow: `0 0 0 1px ${style.color}40` }}
        className={`absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-white ${dimensions.badge}`}
      >
        {style.badge}
      </span>
    </div>
  );
}

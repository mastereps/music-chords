/**
 * The instrument registry — the single place to add an instrument.
 *
 * To add one, append an entry below. That is the whole change: the `Instrument` type,
 * the Add Student dropdown, avatar badges, and every accent colour derive from this map.
 *
 *   Drums: { badge: '🥁', color: '#4F5BD5', tint: '#E7E9FB' }
 *
 * `color` paints the name, percentage, progress bar, and badge ring; `tint` is the soft
 * avatar background, so keep it a pale version of `color`. Colours are applied as inline
 * styles rather than Tailwind classes because they are data — Tailwind cannot generate
 * class names from values only known at runtime.
 */
const INSTRUMENT_STYLES = {
  Piano: { badge: '🎹', color: '#7C5CD6', tint: '#EDE7FB' },
  Guitar: { badge: '🎸', color: '#C57A16', tint: '#FBEFD9' },
  Violin: { badge: '🎻', color: '#3F9A62', tint: '#E6F4EB' },
  Cello: { badge: '🎻', color: '#9B2C4E', tint: '#FAE4EA' },
  Flute: { badge: '🪈', color: '#2E86C1', tint: '#E1EFF9' },
  Clarinet: { badge: '🎶', color: '#0E8A8A', tint: '#DCF0F0' },
  Trumpet: { badge: '🎺', color: '#C2410C', tint: '#FBE5DC' },
  Saxophone: { badge: '🎷', color: '#A9762F', tint: '#F6EBD8' },
  Drums: { badge: '🥁', color: '#4F5BD5', tint: '#E7E9FB' },
  Voice: { badge: '🎤', color: '#DB2777', tint: '#FCE3EF' }
} as const satisfies Record<string, InstrumentStyle>;

export interface InstrumentStyle {
  /** Emoji shown on the avatar badge. */
  badge: string;
  /** Accent colour for the name, percentage, and progress bar. */
  color: string;
  /** Pale avatar background. */
  tint: string;
}

export type Instrument = keyof typeof INSTRUMENT_STYLES;

/** Every instrument, in registry order — drives the Add Student dropdown. */
export const INSTRUMENTS = Object.keys(INSTRUMENT_STYLES) as Instrument[];

export function instrumentStyle(instrument: Instrument): InstrumentStyle {
  return INSTRUMENT_STYLES[instrument];
}

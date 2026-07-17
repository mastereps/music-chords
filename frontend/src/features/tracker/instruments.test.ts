import { describe, expect, it } from 'vitest';

import { INSTRUMENTS, instrumentStyle } from './instruments';

describe('instrument registry', () => {
  it('exposes every registered instrument to the Add Student dropdown', () => {
    expect(INSTRUMENTS).toContain('Piano');
    expect(INSTRUMENTS).toContain('Trumpet');
    expect(INSTRUMENTS).toContain('Drums');
    expect(INSTRUMENTS.length).toBeGreaterThanOrEqual(10);
  });

  // Guards the "adding an instrument is one entry" promise: a malformed entry fails here.
  it('gives every instrument a badge and hex colours', () => {
    for (const instrument of INSTRUMENTS) {
      const style = instrumentStyle(instrument);

      expect(style.badge, `${instrument} badge`).not.toBe('');
      expect(style.color, `${instrument} color`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(style.tint, `${instrument} tint`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('keeps accent colours distinct so students are told apart at a glance', () => {
    const colors = INSTRUMENTS.map((instrument) => instrumentStyle(instrument).color);

    expect(new Set(colors).size).toBe(colors.length);
  });
});

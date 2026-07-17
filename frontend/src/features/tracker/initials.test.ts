import { describe, expect, it } from 'vitest';

import { initialsFor } from './initials';

describe('initialsFor', () => {
  it('takes the first and last initial of a full name', () => {
    expect(initialsFor('Hannah Lee')).toBe('HL');
  });

  it('skips middle names', () => {
    expect(initialsFor('Sofia Isabel Martinez')).toBe('SM');
  });

  it('falls back to the first two letters of a single-word name', () => {
    expect(initialsFor('Prince')).toBe('PR');
  });

  it('ignores surrounding and repeated whitespace', () => {
    expect(initialsFor('  ethan   park  ')).toBe('EP');
  });

  it('returns a placeholder rather than crashing on an empty name', () => {
    expect(initialsFor('   ')).toBe('?');
  });
});

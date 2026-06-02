import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChordSheet } from './ChordSheet';

describe('ChordSheet', () => {
  it('preserves chord spacing and line breaks', () => {
    render(<ChordSheet content={'Verse 1\nC   G/B   Am7\nF   G'} fontSize={18} />);

    const chordSheet = screen.getByText(/Verse 1/);
    expect(chordSheet.textContent).toBe('Verse 1\nC   G/B   Am7\nF   G');
    expect(chordSheet.style.fontSize).toBe('18px');
  });
});

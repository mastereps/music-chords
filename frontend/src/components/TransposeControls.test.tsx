import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TransposeControls } from './TransposeControls';

describe('TransposeControls', () => {
  it('wires transpose and reset actions', () => {
    const onDecrease = vi.fn();
    const onIncrease = vi.fn();
    const onReset = vi.fn();

    render(<TransposeControls offset={2} onDecrease={onDecrease} onIncrease={onIncrease} onReset={onReset} />);

    fireEvent.click(screen.getByRole('button', { name: 'Transpose -' }));
    fireEvent.click(screen.getByRole('button', { name: 'Transpose +' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset (2)' }));

    expect(onDecrease).toHaveBeenCalledOnce();
    expect(onIncrease).toHaveBeenCalledOnce();
    expect(onReset).toHaveBeenCalledOnce();
  });
});

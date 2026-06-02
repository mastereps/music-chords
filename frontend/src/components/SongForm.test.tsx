import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SongForm } from './SongForm';

describe('SongForm', () => {
  it('normalizes metadata without changing chord content spacing', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<SongForm categories={[]} tags={[]} submitLabel="Create song" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: '  Test Song  ' } });
    fireEvent.change(screen.getByLabelText('Artist'), { target: { value: '  Artist  ' } });
    fireEvent.change(screen.getByLabelText('Key'), { target: { value: '  C  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate slug from title' }));
    fireEvent.change(screen.getByLabelText('Chord sheet content'), { target: { value: 'C   G\nAm  F' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create song' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Song',
        artist: 'Artist',
        key: 'C',
        slug: 'test-song',
        content: 'C   G\nAm  F'
      })
    );
  });
});

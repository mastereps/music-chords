import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ResourcesPage } from './ResourcesPage';

const { authState, getResources } = vi.hoisted(() => ({
  authState: {
    user: null as { id: number; email: string; displayName: string; role: 'admin' | 'editor' | 'viewer' } | null
  },
  getResources: vi.fn()
}));

vi.mock('../../api/client', () => ({
  apiClient: {
    getResources,
    getResourcePdfUrl: vi.fn(),
    getResourceImageUrl: vi.fn()
  }
}));

vi.mock('../../app/AuthProvider', () => ({
  useAuth: () => authState
}));

describe('ResourcesPage permissions', () => {
  beforeEach(() => {
    authState.user = null;
    getResources.mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('keeps visitors read-only', async () => {
    render(<ResourcesPage />);

    await waitFor(() => expect(screen.getByText('No resources have been added yet.')).toBeTruthy());
    expect(screen.queryByRole('button', { name: 'Add document' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
  });

  it('shows the resource composer to admins', async () => {
    authState.user = { id: 1, email: 'admin@example.com', displayName: 'Admin', role: 'admin' };
    render(<ResourcesPage />);

    const addDocument = await screen.findByRole('button', { name: 'Add document' });
    fireEvent.click(addDocument);

    expect(screen.getByRole('button', { name: 'Upload PDF' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Upload image' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save resource' })).toBeTruthy();
  });
});

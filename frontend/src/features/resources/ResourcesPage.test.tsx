import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ResourcesPage } from './ResourcesPage';

const { authState, getResourcePdfUrl, getResources } = vi.hoisted(() => ({
  authState: {
    user: null as { id: number; email: string; displayName: string; role: 'admin' | 'editor' | 'viewer' } | null
  },
  getResourcePdfUrl: vi.fn(),
  getResources: vi.fn()
}));

vi.mock('../../api/client', () => ({
  apiClient: {
    getResources,
    getResourcePdfUrl,
    getResourceImageUrl: vi.fn()
  }
}));

vi.mock('../../app/AuthProvider', () => ({
  useAuth: () => authState
}));

describe('ResourcesPage permissions', () => {
  beforeEach(() => {
    authState.user = null;
    getResourcePdfUrl.mockReturnValue('http://localhost:4000/api/resources/compilation-of-music/pdf');
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

  it('filters documents by title and uploaded filename', async () => {
    getResources.mockResolvedValue([
      {
        id: 1,
        title: 'Sunday Service Notes',
        slug: 'sunday-service-notes',
        kind: 'text',
        bodyText: 'Opening prayer',
        originalFilename: null,
        byteSize: null,
        createdAt: '2026-06-02T00:00:00.000Z',
        updatedAt: '2026-06-02T00:00:00.000Z'
      },
      {
        id: 2,
        title: 'Compilation of Music',
        slug: 'compilation-of-music',
        kind: 'pdf',
        bodyText: null,
        originalFilename: 'God In Us.pdf',
        byteSize: 100,
        createdAt: '2026-06-02T00:00:00.000Z',
        updatedAt: '2026-06-02T00:00:00.000Z'
      }
    ]);

    render(<ResourcesPage />);
    await waitFor(() => expect(screen.getAllByText('Sunday Service Notes').length).toBeGreaterThan(0));

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search documents' }), { target: { value: 'god in us' } });

    expect(screen.getAllByText('Sunday Service Notes')).toHaveLength(2);
    expect(screen.getByText('Compilation of Music')).toBeTruthy();

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search documents' }), { target: { value: 'missing' } });
    expect(screen.getByText('No matching documents.')).toBeTruthy();
  });

  it('provides a mobile-friendly PDF open action', async () => {
    getResources.mockResolvedValue([
      {
        id: 2,
        title: 'Compilation of Music',
        slug: 'compilation-of-music',
        kind: 'pdf',
        bodyText: null,
        originalFilename: 'God In Us.pdf',
        byteSize: 100,
        createdAt: '2026-06-02T00:00:00.000Z',
        updatedAt: '2026-06-02T00:00:00.000Z'
      }
    ]);

    render(<ResourcesPage />);

    const openPdf = await screen.findByRole('link', { name: 'Open PDF' });
    expect(openPdf.getAttribute('href')).toBe('http://localhost:4000/api/resources/compilation-of-music/pdf');
    expect(screen.getByTitle('PDF preview: Compilation of Music').className).toContain('sm:block');
  });
});

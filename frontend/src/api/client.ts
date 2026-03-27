import type {
  AuthUser,
  Category,
  PaginatedResponse,
  SongDetail,
  SongInput,
  SongRevision,
  SongSummary,
  Tag,
  SuggestionInput
} from '@music-chords/shared';

export interface DashboardStats {
  totalSongs: number;
  publishedSongs: number;
  draftSongs: number;
  totalCategories: number;
  pendingSuggestions: number;
}

interface SongSearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
  categoryId?: number;
  artist?: string;
  tag?: string;
  language?: string;
  status?: 'draft' | 'published';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

function toSongInput(song: SongDetail): SongInput {
  return {
    title: song.title,
    artist: song.artist,
    key: song.key,
    slug: song.slug,
    content: song.content,
    categoryId: song.category?.id ?? null,
    tagIds: song.tags.map((tag) => tag.id),
    language: song.language,
    status: song.status,
    revisionNote: null
  };
}

function getErrorMessage(data: unknown) {
  const payload = data as {
    message?: string;
    errors?: {
      fieldErrors?: Record<string, string[]>;
      formErrors?: string[];
    };
  };

  const fieldMessages = payload.errors?.fieldErrors
    ? Object.values(payload.errors.fieldErrors)
        .flat()
        .filter(Boolean)
    : [];

  return fieldMessages[0] ?? payload.errors?.formErrors?.[0] ?? payload.message ?? 'Request failed';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }

  return data as T;
}

function toQueryString(params: SongSearchParams) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : '';
}

export const apiClient = {
  async login(email: string, password: string) {
    const data = await request<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    return data.user;
  },
  async getMe() {
    const data = await request<{ user: AuthUser }>('/api/auth/me');
    return data.user;
  },
  async logout() {
    await request('/api/auth/logout', { method: 'POST' });
  },
  async getSongs(params: SongSearchParams, signal?: AbortSignal) {
    return request<PaginatedResponse<SongSummary>>(`/api/songs${toQueryString(params)}`, { signal });
  },
  async getSong(slug: string, signal?: AbortSignal) {
    const data = await request<{ item: SongDetail }>(`/api/songs/${slug}`, { signal });
    return data.item;
  },
  async createSong(input: SongInput) {
    const data = await request<{ item: SongDetail }>('/api/songs', {
      method: 'POST',
      body: JSON.stringify(input)
    });

    return data.item;
  },
  async updateSong(id: number, input: SongInput) {
    const data = await request<{ item: SongDetail }>(`/api/songs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    });

    return data.item;
  },
  async updateSongStatus(slug: string, status: 'draft' | 'published', revisionNote?: string | null) {
    const song = await this.getSong(slug);
    return this.updateSong(song.id, {
      ...toSongInput(song),
      status,
      revisionNote: revisionNote ?? null
    });
  },
  async deleteSong(id: number) {
    await request(`/api/songs/${id}`, { method: 'DELETE' });
  },
  async getRevisions(songId: number, signal?: AbortSignal) {
    const data = await request<{ items: SongRevision[] }>(`/api/songs/${songId}/revisions`, { signal });
    return data.items;
  },
  async suggestCorrection(songId: number, input: SuggestionInput) {
    await request(`/api/songs/${songId}/suggestions`, {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },
  async getCategories(signal?: AbortSignal) {
    const data = await request<{ items: Category[] }>('/api/categories', { signal });
    return data.items;
  },
  async createCategory(input: Omit<Category, 'id'>) {
    const data = await request<{ item: Category }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(input)
    });

    return data.item;
  },
  async updateCategory(id: number, input: Omit<Category, 'id'>) {
    const data = await request<{ item: Category }>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    });

    return data.item;
  },
  async deleteCategory(id: number) {
    await request(`/api/categories/${id}`, { method: 'DELETE' });
  },
  async getTags(signal?: AbortSignal) {
    const data = await request<{ items: Tag[] }>('/api/tags', { signal });
    return data.items;
  },
  async getDashboardStats(signal?: AbortSignal) {
    const data = await request<{ item: DashboardStats }>('/api/admin/dashboard', { signal });
    return data.item;
  }
};

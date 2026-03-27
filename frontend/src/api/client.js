const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';
function toSongInput(song) {
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
function getErrorMessage(data) {
    const payload = data;
    const fieldMessages = payload.errors?.fieldErrors
        ? Object.values(payload.errors.fieldErrors)
            .flat()
            .filter(Boolean)
        : [];
    return fieldMessages[0] ?? payload.errors?.formErrors?.[0] ?? payload.message ?? 'Request failed';
}
async function request(path, init) {
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
    return data;
}
function toQueryString(params) {
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
    async login(email, password) {
        const data = await request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        return data.user;
    },
    async getMe() {
        const data = await request('/api/auth/me');
        return data.user;
    },
    async logout() {
        await request('/api/auth/logout', { method: 'POST' });
    },
    async getSongs(params, signal) {
        return request(`/api/songs${toQueryString(params)}`, { signal });
    },
    async getSong(slug, signal) {
        const data = await request(`/api/songs/${slug}`, { signal });
        return data.item;
    },
    async createSong(input) {
        const data = await request('/api/songs', {
            method: 'POST',
            body: JSON.stringify(input)
        });
        return data.item;
    },
    async updateSong(id, input) {
        const data = await request(`/api/songs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(input)
        });
        return data.item;
    },
    async updateSongStatus(slug, status, revisionNote) {
        const song = await this.getSong(slug);
        return this.updateSong(song.id, {
            ...toSongInput(song),
            status,
            revisionNote: revisionNote ?? null
        });
    },
    async deleteSong(id) {
        await request(`/api/songs/${id}`, { method: 'DELETE' });
    },
    async getRevisions(songId, signal) {
        const data = await request(`/api/songs/${songId}/revisions`, { signal });
        return data.items;
    },
    async suggestCorrection(songId, input) {
        await request(`/api/songs/${songId}/suggestions`, {
            method: 'POST',
            body: JSON.stringify(input)
        });
    },
    async getLineups(signal) {
        const data = await request('/api/lineups', { signal });
        return data.items;
    },
    async getLineup(id, signal) {
        const data = await request(`/api/lineups/${id}`, { signal });
        return data.item;
    },
    async createLineup(input) {
        const data = await request('/api/lineups', {
            method: 'POST',
            body: JSON.stringify(input)
        });
        return data.item;
    },
    async updateLineup(id, input) {
        const data = await request(`/api/lineups/${id}`, {
            method: 'PUT',
            body: JSON.stringify(input)
        });
        return data.item;
    },
    async deleteLineup(id) {
        await request(`/api/lineups/${id}`, { method: 'DELETE' });
    },
    async getCategories(signal) {
        const data = await request('/api/categories', { signal });
        return data.items;
    },
    async createCategory(input) {
        const data = await request('/api/categories', {
            method: 'POST',
            body: JSON.stringify(input)
        });
        return data.item;
    },
    async updateCategory(id, input) {
        const data = await request(`/api/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(input)
        });
        return data.item;
    },
    async deleteCategory(id) {
        await request(`/api/categories/${id}`, { method: 'DELETE' });
    },
    async getTags(signal) {
        const data = await request('/api/tags', { signal });
        return data.items;
    },
    async getDashboardStats(signal) {
        const data = await request('/api/admin/dashboard', { signal });
        return data.item;
    }
};

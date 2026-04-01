import { describe, expect, it } from 'vitest';

import { loginSchema } from '../modules/auth/auth.schemas';
import { songPinSchema, songSchema, songSearchSchema, suggestionSchema } from '../modules/songs/songs.schemas';

describe('songSchema', () => {
  it('accepts a valid song payload', () => {
    const result = songSchema.parse({
      title: 'Sample Song',
      artist: 'Artist',
      key: 'C',
      slug: 'sample-song',
      content: 'Verse 1\nC   G   Am',
      categoryId: 1,
      tagIds: [1, 2],
      language: 'English',
      status: 'published',
      revisionNote: 'Fixed typo'
    });

    expect(result.slug).toBe('sample-song');
  });

  it('rejects an empty or whitespace-only content body', () => {
    expect(() =>
      songSchema.parse({
        title: 'Bad Song',
        key: 'D',
        slug: 'bad-song',
        content: '   \n   ',
        tagIds: [],
        status: 'draft'
      })
    ).toThrow();
  });

  it('rejects duplicate tag ids', () => {
    expect(() =>
      songSchema.parse({
        title: 'Bad Song',
        key: 'D',
        slug: 'bad-song',
        content: 'C   G',
        tagIds: [1, 1],
        status: 'draft'
      })
    ).toThrow();
  });
});

describe('songSearchSchema', () => {
  it('coerces paging values', () => {
    const result = songSearchSchema.parse({ page: '2', pageSize: '10' });

    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
  });

  it('normalizes blank search inputs to undefined', () => {
    const result = songSearchSchema.parse({ q: '   ', tag: '', artist: '  ' });

    expect(result.q).toBeUndefined();
    expect(result.tag).toBeUndefined();
    expect(result.artist).toBeUndefined();
  });

  it('parses prioritizePinned query values', () => {
    expect(songSearchSchema.parse({ prioritizePinned: 'true' }).prioritizePinned).toBe(true);
    expect(songSearchSchema.parse({ prioritizePinned: 'false' }).prioritizePinned).toBe(false);
    expect(songSearchSchema.parse({}).prioritizePinned).toBe(false);
  });
});

describe('songPinSchema', () => {
  it('accepts a boolean pinned payload', () => {
    expect(songPinSchema.parse({ pinned: true }).pinned).toBe(true);
  });

  it('rejects a non-boolean pinned payload', () => {
    expect(() => songPinSchema.parse({ pinned: 'true' })).toThrow();
  });
});

describe('suggestionSchema', () => {
  it('rejects blank messages', () => {
    expect(() => suggestionSchema.parse({ message: '', proposedContent: 'C   G' })).toThrow();
  });

  it('rejects blank suggested content', () => {
    expect(() => suggestionSchema.parse({ message: 'Fix verse', proposedContent: '   ' })).toThrow();
  });
});

describe('loginSchema', () => {
  it('rejects invalid emails', () => {
    expect(() => loginSchema.parse({ email: 'bad', password: 'password123' })).toThrow();
  });
});

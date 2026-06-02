import { describe, expect, it } from 'vitest';

import { loginSchema } from '../modules/auth/auth.schemas';
import { categoryParamsSchema, categorySchema } from '../modules/categories/categories.schemas';
import { lineupParamsSchema, lineupSchema } from '../modules/lineups/lineups.schemas';
import { imageResourceQuerySchema, pdfResourceQuerySchema, resourceParamsSchema, textResourceSchema } from '../modules/resources/resources.schemas';
import { songParamsSchema, songPinSchema, songSchema, songSearchSchema, suggestionSchema } from '../modules/songs/songs.schemas';

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

describe('path parameter schemas', () => {
  it('coerces positive numeric ids', () => {
    expect(songParamsSchema.parse({ id: '4' }).id).toBe(4);
    expect(categoryParamsSchema.parse({ id: '5' }).id).toBe(5);
    expect(lineupParamsSchema.parse({ id: '6' }).id).toBe(6);
    expect(resourceParamsSchema.parse({ id: '7' }).id).toBe(7);
  });

  it('rejects malformed ids', () => {
    expect(() => songParamsSchema.parse({ id: 'not-a-number' })).toThrow();
    expect(() => categoryParamsSchema.parse({ id: '0' })).toThrow();
    expect(() => lineupParamsSchema.parse({ id: '-1' })).toThrow();
    expect(() => resourceParamsSchema.parse({ id: 'not-a-number' })).toThrow();
  });
});

describe('categorySchema', () => {
  it('rejects invalid slugs', () => {
    expect(() => categorySchema.parse({ name: 'Worship', slug: 'Not Valid', sortOrder: 0 })).toThrow();
  });
});

describe('lineupSchema', () => {
  it('accepts an ordered list of songs', () => {
    expect(lineupSchema.parse({ title: 'Sunday', songIds: [3, 1, 2] }).songIds).toEqual([3, 1, 2]);
  });

  it('rejects empty or duplicate song lists', () => {
    expect(() => lineupSchema.parse({ title: 'Sunday', songIds: [] })).toThrow();
    expect(() => lineupSchema.parse({ title: 'Sunday', songIds: [1, 1] })).toThrow();
  });
});

describe('resource schemas', () => {
  it('accepts valid pasted text and PDF metadata', () => {
    expect(textResourceSchema.parse({ title: 'Service Flow', slug: 'service-flow', bodyText: 'Opening prayer' }).slug).toBe(
      'service-flow'
    );
    expect(pdfResourceQuerySchema.parse({ title: 'Checklist', slug: 'checklist', filename: 'checklist.pdf' }).filename).toBe(
      'checklist.pdf'
    );
    expect(imageResourceQuerySchema.parse({ title: 'Poster', slug: 'poster', filename: 'poster.png' }).filename).toBe('poster.png');
  });

  it('rejects blank pasted text and invalid resource slugs', () => {
    expect(() => textResourceSchema.parse({ title: 'Blank', slug: 'blank', bodyText: '   ' })).toThrow();
    expect(() => pdfResourceQuerySchema.parse({ title: 'Bad', slug: 'Bad Slug', filename: 'file.pdf' })).toThrow();
  });
});

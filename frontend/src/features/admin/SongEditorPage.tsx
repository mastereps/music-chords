import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import type { Category, SongInput, SongRevision, Tag } from '@music-chords/shared';

import { apiClient } from '../../api/client';
import { RevisionList } from '../../components/RevisionList';
import { SongForm } from '../../components/SongForm';

export function SongEditorPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [initialValue, setInitialValue] = useState<SongInput | undefined>(undefined);
  const [songId, setSongId] = useState<number | null>(null);
  const [revisions, setRevisions] = useState<SongRevision[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([apiClient.getCategories(), apiClient.getTags()])
      .then(([loadedCategories, loadedTags]) => {
        setCategories(loadedCategories);
        setTags(loadedTags);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load form options.'));
  }, []);

  useEffect(() => {
    if (!slug) {
      return;
    }

    void apiClient
      .getSong(slug)
      .then(async (song) => {
        setSongId(song.id);
        setInitialValue({
          title: song.title,
          artist: song.artist,
          key: song.key,
          slug: song.slug,
          content: song.content,
          categoryId: song.category?.id ?? null,
          tagIds: song.tags.map((tag) => tag.id),
          language: song.language,
          status: song.status,
          revisionNote: ''
        });
        const history = await apiClient.getRevisions(song.id);
        setRevisions(history);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load song.'));
  }, [slug]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">Editor</p>
          <h2 className="text-2xl font-semibold">{slug ? 'Edit song' : 'Create song'}</h2>
        </div>
        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <SongForm
          categories={categories}
          tags={tags}
          initialValue={initialValue}
          submitLabel={slug ? 'Save changes' : 'Create song'}
          onSubmit={async (input) => {
            if (songId) {
              const song = await apiClient.updateSong(songId, input);
              navigate(`/songs/${song.slug}`);
              return;
            }

            const song = await apiClient.createSong(input);
            navigate(`/songs/${song.slug}`);
          }}
        />
      </section>
      <aside>{slug ? <RevisionList items={revisions} /> : null}</aside>
    </div>
  );
}

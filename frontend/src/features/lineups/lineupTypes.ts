import type { SongSummary } from '@music-chords/shared';

export interface LineupSong {
  id: number;
  slug: string;
  title: string;
  artist: string | null;
  key: string;
}

export interface Lineup {
  id: string;
  name: string;
  songs: LineupSong[];
  createdAt: string;
  updatedAt: string;
}

export interface LineupInput {
  id?: string | null;
  name: string;
  songs: LineupSong[];
}

export function toLineupSong(song: SongSummary): LineupSong {
  return {
    id: song.id,
    slug: song.slug,
    title: song.title,
    artist: song.artist,
    key: song.key
  };
}

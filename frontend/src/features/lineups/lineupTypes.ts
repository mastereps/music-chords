import type { LineupDetail, LineupInput, LineupSong, LineupSummary, SongSummary } from '@music-chords/shared';

export function toLineupSong(song: SongSummary): LineupSong {
  return {
    id: song.id,
    slug: song.slug,
    title: song.title,
    artist: song.artist,
    key: song.key
  };
}

export type { LineupDetail, LineupInput, LineupSong, LineupSummary };

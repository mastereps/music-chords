export function toLineupSong(song) {
    return {
        id: song.id,
        slug: song.slug,
        title: song.title,
        artist: song.artist,
        key: song.key
    };
}

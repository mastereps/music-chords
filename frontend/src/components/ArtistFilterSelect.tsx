export function ArtistFilterSelect({
  artists,
  value,
  onChange
}: {
  artists: readonly string[];
  value: string;
  onChange: (artist: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-4  dark:border-stone-800 dark:bg-stone-900">
      <label htmlFor="artist-filter" className="text-sm font-semibold text-stone-700 dark:text-stone-200">
        Artist
      </label>
      <select
        id="artist-filter"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
      >
        <option value="">All</option>
        {artists.map((artist) => (
          <option key={artist} value={artist}>
            {artist}
          </option>
        ))}
      </select>
    </div>
  );
}

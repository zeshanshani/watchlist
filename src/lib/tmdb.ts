import type { TmdbSearchResult, MediaType } from '../types';

const BASE = 'https://api.themoviedb.org/3';
export const IMG_BASE = 'https://image.tmdb.org/t/p';

export function posterUrl(path: string | null | undefined, size: 'w185' | 'w342' | 'w500' = 'w342'): string | undefined {
  if (!path) return undefined;
  return `${IMG_BASE}/${size}${path}`;
}

function yearFromDate(d?: string): number | undefined {
  if (!d) return undefined;
  const y = parseInt(d.slice(0, 4), 10);
  return Number.isFinite(y) ? y : undefined;
}

export async function searchMulti(query: string, apiKey: string, signal?: AbortSignal): Promise<TmdbSearchResult[]> {
  if (!apiKey) throw new Error('TMDB API key is not set. Open Settings to add it.');
  const url = `${BASE}/search/multi?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`TMDB error ${res.status}: ${body || res.statusText}`);
  }
  const data = await res.json();
  const results = Array.isArray(data.results) ? data.results : [];
  return results
    .filter((r: { media_type?: string }) => r.media_type === 'movie' || r.media_type === 'tv')
    .map((r: {
      id: number;
      media_type: MediaType;
      title?: string;
      name?: string;
      release_date?: string;
      first_air_date?: string;
      poster_path: string | null;
      overview?: string;
    }): TmdbSearchResult => ({
      id: r.id,
      media_type: r.media_type,
      title: r.media_type === 'movie' ? (r.title ?? '') : (r.name ?? ''),
      year: yearFromDate(r.media_type === 'movie' ? r.release_date : r.first_air_date),
      posterPath: r.poster_path,
      overview: r.overview ?? '',
    }));
}

export async function fetchDetails(
  type: MediaType,
  tmdbId: number,
  apiKey: string,
): Promise<{ runtime?: number }> {
  if (!apiKey) return {};
  const url = `${BASE}/${type}/${tmdbId}?api_key=${encodeURIComponent(apiKey)}&language=en-US`;
  const res = await fetch(url);
  if (!res.ok) return {};
  const data = await res.json();
  if (type === 'movie') {
    return { runtime: typeof data.runtime === 'number' ? data.runtime : undefined };
  }
  const ep = Array.isArray(data.episode_run_time) ? data.episode_run_time[0] : undefined;
  return { runtime: typeof ep === 'number' ? ep : undefined };
}

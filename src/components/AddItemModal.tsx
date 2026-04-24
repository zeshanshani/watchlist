import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import type { Item, TmdbSearchResult } from '../types';
import { fetchDetails, posterUrl, searchMulti } from '../lib/tmdb';

type Props = {
  apiKey: string;
  existing: Item[];
  onClose: () => void;
  onAdd: (item: Item) => void;
  onNeedKey: () => void;
};

export default function AddItemModal({ apiKey, existing, onClose, onAdd, onNeedKey }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); setError(null); return; }
    if (!apiKey) { setError('Add your TMDB API key in Settings to search.'); return; }
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await searchMulti(q, apiKey, ctl.signal);
        setResults(r);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { ctl.abort(); clearTimeout(t); };
  }, [query, apiKey]);

  async function pick(r: TmdbSearchResult) {
    const details = await fetchDetails(r.media_type, r.id, apiKey).catch(() => ({} as { runtime?: number }));
    const item: Item = {
      id: crypto.randomUUID(),
      tmdbId: r.id,
      type: r.media_type,
      title: r.title,
      year: r.year,
      posterPath: r.posterPath,
      overview: r.overview,
      runtime: details.runtime,
      addedAt: new Date().toISOString(),
      watched: false,
      tags: [],
    };
    onAdd(item);
  }

  function addManual() {
    const title = query.trim();
    if (!title) return;
    const item: Item = {
      id: crypto.randomUUID(),
      type: 'movie',
      title,
      addedAt: new Date().toISOString(),
      watched: false,
      tags: [],
    };
    onAdd(item);
  }

  const hasKey = apiKey.length > 0;

  return (
    <Modal title="Add to watchlist" onClose={onClose}>
      <input
        ref={inputRef}
        className="input"
        type="search"
        placeholder={hasKey ? 'Search movies & TV…' : 'Type a title (add key to search TMDB)'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {!hasKey && (
        <div className="notice">
          <p>TMDB key not set. You can still add titles manually.</p>
          <button className="btn btn-link" onClick={onNeedKey}>Open settings →</button>
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {loading && <div className="muted pad">Searching…</div>}

      {results.length > 0 && (
        <ul className="search-results">
          {results.map((r) => {
            const alreadyAdded = existing.some((e) => e.tmdbId === r.id && e.type === r.media_type);
            const poster = posterUrl(r.posterPath, 'w185');
            return (
              <li key={`${r.media_type}-${r.id}`} className="search-result">
                <div className="result-thumb">
                  {poster ? <img src={poster} alt="" loading="lazy" /> : <div className="poster-fallback small"><span>{r.title.slice(0, 1)}</span></div>}
                </div>
                <div className="result-info">
                  <div className="result-title">
                    <span>{r.title}</span>
                    {r.year && <span className="muted"> · {r.year}</span>}
                    <span className={`type-badge type-${r.media_type} small`}>{r.media_type === 'movie' ? 'Movie' : 'TV'}</span>
                  </div>
                  {r.overview && <div className="result-overview">{r.overview}</div>}
                </div>
                <button
                  className="btn btn-primary"
                  disabled={alreadyAdded}
                  onClick={() => pick(r)}
                >
                  {alreadyAdded ? 'Added' : 'Add'}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {query.trim() && !loading && results.length === 0 && !error && (
        <div className="pad">
          <p className="muted">No results from TMDB (or search is disabled).</p>
          <button className="btn" onClick={addManual}>Add "{query.trim()}" manually</button>
        </div>
      )}
    </Modal>
  );
}

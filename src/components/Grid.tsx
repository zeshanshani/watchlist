import type { Item } from '../types';
import { posterUrl } from '../lib/tmdb';

type Props = {
  items: Item[];
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
};

export default function Grid({ items, onOpen, onToggle }: Props) {
  return (
    <div className="grid">
      {items.map((it) => {
        const poster = posterUrl(it.posterPath, 'w342');
        return (
          <div key={it.id} className={`card ${it.watched ? 'card-watched' : ''}`}>
            <button className="card-poster" onClick={() => onOpen(it.id)}>
              {poster ? (
                <img src={poster} alt={it.title} loading="lazy" />
              ) : (
                <div className="poster-fallback">
                  <span>{it.title.slice(0, 1)}</span>
                </div>
              )}
              <span className={`type-badge type-${it.type}`}>{it.type === 'movie' ? 'Movie' : 'TV'}</span>
              {typeof it.rating === 'number' && (
                <span className="rating-badge">★ {it.rating}</span>
              )}
            </button>
            <div className="card-body">
              <div className="card-title" onClick={() => onOpen(it.id)}>
                <span>{it.title}</span>
                {it.year && <span className="muted"> · {it.year}</span>}
              </div>
              <button
                className={`check ${it.watched ? 'checked' : ''}`}
                onClick={() => onToggle(it.id)}
                aria-label={it.watched ? 'Mark as unwatched' : 'Mark as watched'}
                title={it.watched ? 'Mark as unwatched' : 'Mark as watched'}
              >
                {it.watched ? '✓' : ''}
              </button>
            </div>
            {it.tags.length > 0 && (
              <div className="card-tags">
                {it.tags.slice(0, 3).map((t) => (
                  <span key={t} className="tag">#{t}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

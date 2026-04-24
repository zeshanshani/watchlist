import type { Item } from '../types';
import { posterUrl } from '../lib/tmdb';

type Props = {
  items: Item[];
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
};

export default function List({ items, onOpen, onToggle }: Props) {
  return (
    <ul className="list">
      {items.map((it) => {
        const poster = posterUrl(it.posterPath, 'w185');
        return (
          <li key={it.id} className={`row ${it.watched ? 'row-watched' : ''}`}>
            <button
              className={`check ${it.watched ? 'checked' : ''}`}
              onClick={() => onToggle(it.id)}
              aria-label={it.watched ? 'Mark as unwatched' : 'Mark as watched'}
            >
              {it.watched ? '✓' : ''}
            </button>
            <button className="row-main" onClick={() => onOpen(it.id)}>
              <div className="row-thumb">
                {poster ? <img src={poster} alt="" loading="lazy" /> : <div className="poster-fallback small"><span>{it.title.slice(0, 1)}</span></div>}
              </div>
              <div className="row-text">
                <div className="row-title">
                  <span>{it.title}</span>
                  {it.year && <span className="muted"> · {it.year}</span>}
                  <span className={`type-badge type-${it.type} small`}>{it.type === 'movie' ? 'Movie' : 'TV'}</span>
                </div>
                <div className="row-meta">
                  {typeof it.rating === 'number' && <span className="meta-item">★ {it.rating}</span>}
                  {it.tags.map((t) => (
                    <span key={t} className="tag">#{t}</span>
                  ))}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

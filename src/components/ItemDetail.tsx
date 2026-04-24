import Modal from './Modal';
import StarRating from './StarRating';
import TagInput from './TagInput';
import type { Item } from '../types';
import { posterUrl } from '../lib/tmdb';

type Props = {
  item: Item;
  onClose: () => void;
  onUpdate: (patch: Partial<Item>) => void;
  onDelete: () => void;
  onToggle: () => void;
};

export default function ItemDetail({ item, onClose, onUpdate, onDelete, onToggle }: Props) {
  const poster = posterUrl(item.posterPath, 'w342');

  return (
    <Modal
      title={item.title}
      onClose={onClose}
      footer={
        <>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (confirm(`Delete "${item.title}" from your list?`)) {
                onDelete();
                onClose();
              }
            }}
          >Delete</button>
          <div className="spacer" />
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={onToggle}>
            {item.watched ? 'Mark as unwatched' : 'Mark as watched'}
          </button>
        </>
      }
    >
      <div className="detail">
        <div className="detail-poster">
          {poster ? <img src={poster} alt="" /> : <div className="poster-fallback"><span>{item.title.slice(0, 1)}</span></div>}
        </div>
        <div className="detail-info">
          <div className="detail-meta">
            <span className={`type-badge type-${item.type}`}>{item.type === 'movie' ? 'Movie' : 'TV'}</span>
            {item.year && <span className="muted">{item.year}</span>}
            {typeof item.runtime === 'number' && item.runtime > 0 && (
              <span className="muted">{item.runtime} min{item.type === 'tv' ? ' / ep' : ''}</span>
            )}
            {item.watched && item.watchedAt && (
              <span className="muted">Watched {new Date(item.watchedAt).toLocaleDateString()}</span>
            )}
          </div>

          {item.overview && <p className="overview">{item.overview}</p>}

          <label className="field">
            <span className="field-label">Your rating</span>
            <StarRating value={item.rating} onChange={(v) => onUpdate({ rating: v })} />
          </label>

          <label className="field">
            <span className="field-label">Tags</span>
            <TagInput tags={item.tags} onChange={(tags) => onUpdate({ tags })} />
          </label>

          <label className="field">
            <span className="field-label">Notes</span>
            <textarea
              className="textarea"
              rows={4}
              value={item.notes ?? ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Thoughts, who recommended it, where to watch…"
            />
          </label>
        </div>
      </div>
    </Modal>
  );
}

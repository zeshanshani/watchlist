type Props = {
  typeFilter: 'all' | 'movie' | 'tv';
  onTypeChange: (v: 'all' | 'movie' | 'tv') => void;
  tags: string[];
  activeTag: string | null;
  onTagChange: (t: string | null) => void;
};

export default function Filters({ typeFilter, onTypeChange, tags, activeTag, onTagChange }: Props) {
  return (
    <div className="filters">
      <div className="chip-group">
        <button
          className={`chip ${typeFilter === 'all' ? 'chip-active' : ''}`}
          onClick={() => onTypeChange('all')}
        >All</button>
        <button
          className={`chip ${typeFilter === 'movie' ? 'chip-active' : ''}`}
          onClick={() => onTypeChange('movie')}
        >Movies</button>
        <button
          className={`chip ${typeFilter === 'tv' ? 'chip-active' : ''}`}
          onClick={() => onTypeChange('tv')}
        >TV</button>
      </div>
      {tags.length > 0 && (
        <div className="chip-group chip-group-tags">
          <button
            className={`chip ${activeTag === null ? 'chip-active' : ''}`}
            onClick={() => onTagChange(null)}
          >All tags</button>
          {tags.map((t) => (
            <button
              key={t}
              className={`chip ${activeTag === t ? 'chip-active' : ''}`}
              onClick={() => onTagChange(activeTag === t ? null : t)}
            >#{t}</button>
          ))}
        </div>
      )}
    </div>
  );
}

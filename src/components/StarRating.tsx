type Props = {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
};

export default function StarRating({ value, onChange }: Props) {
  return (
    <div className="stars" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          className={`star ${value && n <= value ? 'on' : ''}`}
          onClick={() => onChange(value === n ? undefined : n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          type="button"
        >★</button>
      ))}
      {typeof value === 'number' && (
        <button className="btn btn-link" onClick={() => onChange(undefined)} type="button">clear</button>
      )}
    </div>
  );
}

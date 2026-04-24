import { useState, type KeyboardEvent } from 'react';

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
};

export default function TagInput({ tags, onChange }: Props) {
  const [input, setInput] = useState('');

  function commit() {
    const t = input.trim().toLowerCase().replace(/^#/, '');
    if (!t) return;
    if (tags.includes(t)) { setInput(''); return; }
    onChange([...tags, t]);
    setInput('');
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function remove(t: string) {
    onChange(tags.filter((x) => x !== t));
  }

  return (
    <div className="tag-input">
      {tags.map((t) => (
        <span key={t} className="tag tag-removable">
          #{t}
          <button onClick={() => remove(t)} aria-label={`Remove ${t}`}>×</button>
        </span>
      ))}
      <input
        className="tag-input-field"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
        placeholder={tags.length === 0 ? 'Add tag and press Enter' : ''}
      />
    </div>
  );
}

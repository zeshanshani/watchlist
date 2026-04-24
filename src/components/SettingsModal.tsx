import { useRef, useState } from 'react';
import Modal from './Modal';
import type { Item, Settings } from '../types';
import { exportJSON, importJSON } from '../lib/storage';

type Props = {
  settings: Settings;
  items: Item[];
  onChange: (s: Settings) => void;
  onReplaceItems: (items: Item[]) => void;
  onClose: () => void;
};

export default function SettingsModal({ settings, items, onChange, onReplaceItems, onClose }: Props) {
  const [key, setKey] = useState(settings.tmdbKey);
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function save() {
    onChange({ ...settings, tmdbKey: key.trim() });
    setStatus('Saved.');
    setTimeout(() => setStatus(null), 1500);
  }

  function downloadBackup() {
    const blob = new Blob([exportJSON(items)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watchlist-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = importJSON(text);
      if (!confirm(`Import ${parsed.length} items? This replaces your current list.`)) return;
      onReplaceItems(parsed);
      setStatus(`Imported ${parsed.length} items.`);
    } catch (err) {
      setStatus(`Import failed: ${(err as Error).message}`);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <Modal
      title="Settings"
      onClose={onClose}
      footer={<button className="btn" onClick={onClose}>Close</button>}
    >
      <div className="settings">
        <section>
          <h3>TMDB API key</h3>
          <p className="muted">
            Used to search for movies & shows and pull posters, years, and descriptions.
            Stored only in your browser.
          </p>
          <div className="row-inline">
            <input
              className="input"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste your TMDB API key (v3 auth)"
              autoComplete="off"
            />
            <button className="btn btn-primary" onClick={save}>Save</button>
          </div>
          <p className="muted small">
            Don't have one? Create a free TMDB account at{' '}
            <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer">themoviedb.org</a>,
            then go to Settings → API and copy the "API Key (v3 auth)".
          </p>
        </section>

        <section>
          <h3>Backup & restore</h3>
          <p className="muted">Your data lives in this browser. Export a JSON backup any time.</p>
          <div className="row-inline">
            <button className="btn" onClick={downloadBackup}>Export JSON</button>
            <button className="btn" onClick={() => fileRef.current?.click()}>Import JSON…</button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={onFile} />
          </div>
        </section>

        {status && <div className="notice">{status}</div>}
      </div>
    </Modal>
  );
}

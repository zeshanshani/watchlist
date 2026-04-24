import { useEffect, useMemo, useState } from 'react';
import type { Item, Settings, Tab, ViewMode } from './types';
import { loadItems, loadSettings, saveItems, saveSettings } from './lib/storage';
import AddItemModal from './components/AddItemModal';
import ItemDetail from './components/ItemDetail';
import SettingsModal from './components/SettingsModal';
import Grid from './components/Grid';
import List from './components/List';
import Filters from './components/Filters';

export default function App() {
  const [items, setItems] = useState<Item[]>(() => loadItems());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [tab, setTab] = useState<Tab>('watchlist');
  const [view, setView] = useState<ViewMode>('grid');
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => { saveItems(items); }, [items]);
  useEffect(() => { saveSettings(settings); }, [settings]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) for (const t of it.tags) s.add(t);
    return [...s].sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((it) => (tab === 'watched' ? it.watched : !it.watched))
      .filter((it) => (typeFilter === 'all' ? true : it.type === typeFilter))
      .filter((it) => (tagFilter ? it.tags.includes(tagFilter) : true))
      .filter((it) => (q ? it.title.toLowerCase().includes(q) : true))
      .sort((a, b) => {
        if (tab === 'watched') {
          return (b.watchedAt ?? '').localeCompare(a.watchedAt ?? '');
        }
        return (b.addedAt ?? '').localeCompare(a.addedAt ?? '');
      });
  }, [items, tab, typeFilter, tagFilter, query]);

  const counts = useMemo(() => ({
    watchlist: items.filter((i) => !i.watched).length,
    watched: items.filter((i) => i.watched).length,
  }), [items]);

  const active = activeId ? items.find((i) => i.id === activeId) ?? null : null;

  function addItem(newItem: Item) {
    setItems((prev) => {
      const dup = prev.find((p) => p.tmdbId && p.tmdbId === newItem.tmdbId && p.type === newItem.type);
      if (dup) return prev;
      return [newItem, ...prev];
    });
  }

  function updateItem(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function toggleWatched(id: string) {
    setItems((prev) => prev.map((it) => {
      if (it.id !== id) return it;
      const watched = !it.watched;
      return { ...it, watched, watchedAt: watched ? new Date().toISOString() : undefined };
    }));
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          <h1>Watchlist</h1>
        </div>
        <div className="top-actions">
          <input
            className="search"
            type="search"
            placeholder="Search your list…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add</button>
          <button className="btn btn-ghost" onClick={() => setShowSettings(true)} aria-label="Settings">⚙</button>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${tab === 'watchlist' ? 'tab-active' : ''}`}
          onClick={() => setTab('watchlist')}
        >
          To watch <span className="count">{counts.watchlist}</span>
        </button>
        <button
          className={`tab ${tab === 'watched' ? 'tab-active' : ''}`}
          onClick={() => setTab('watched')}
        >
          Watched <span className="count">{counts.watched}</span>
        </button>
        <div className="tabs-spacer" />
        <div className="view-toggle">
          <button
            className={`view-btn ${view === 'grid' ? 'active' : ''}`}
            onClick={() => setView('grid')}
            aria-label="Grid view"
          >▦</button>
          <button
            className={`view-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
            aria-label="List view"
          >☰</button>
        </div>
      </nav>

      <Filters
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        tags={allTags}
        activeTag={tagFilter}
        onTagChange={setTagFilter}
      />

      <main className="content">
        {filtered.length === 0 ? (
          <EmptyState tab={tab} onAdd={() => setShowAdd(true)} />
        ) : view === 'grid' ? (
          <Grid items={filtered} onOpen={(id) => setActiveId(id)} onToggle={toggleWatched} />
        ) : (
          <List items={filtered} onOpen={(id) => setActiveId(id)} onToggle={toggleWatched} />
        )}
      </main>

      {showAdd && (
        <AddItemModal
          apiKey={settings.tmdbKey}
          existing={items}
          onClose={() => setShowAdd(false)}
          onAdd={(it) => { addItem(it); setShowAdd(false); }}
          onNeedKey={() => { setShowAdd(false); setShowSettings(true); }}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          items={items}
          onChange={setSettings}
          onReplaceItems={setItems}
          onClose={() => setShowSettings(false)}
        />
      )}

      {active && (
        <ItemDetail
          item={active}
          onClose={() => setActiveId(null)}
          onUpdate={(patch) => updateItem(active.id, patch)}
          onDelete={() => deleteItem(active.id)}
          onToggle={() => toggleWatched(active.id)}
        />
      )}
    </div>
  );
}

function EmptyState({ tab, onAdd }: { tab: Tab; onAdd: () => void }) {
  return (
    <div className="empty">
      {tab === 'watchlist' ? (
        <>
          <p>Your watchlist is empty.</p>
          <button className="btn btn-primary" onClick={onAdd}>Add your first pick</button>
        </>
      ) : (
        <p>Nothing watched yet. Tick things off your list and they'll show up here.</p>
      )}
    </div>
  );
}

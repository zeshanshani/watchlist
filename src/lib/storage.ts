import type { Item, Settings } from '../types';

const ITEMS_KEY = 'watchlist.items.v1';
const SETTINGS_KEY = 'watchlist.settings.v1';

export function loadItems(): Item[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveItems(items: Item[]): void {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { tmdbKey: '' };
    return { tmdbKey: '', ...JSON.parse(raw) };
  } catch {
    return { tmdbKey: '' };
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportJSON(items: Item[]): string {
  return JSON.stringify(items, null, 2);
}

export function importJSON(text: string): Item[] {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('Expected a JSON array');
  return parsed as Item[];
}

export type MediaType = 'movie' | 'tv';

export type Item = {
  id: string;
  tmdbId?: number;
  type: MediaType;
  title: string;
  year?: number;
  posterPath?: string | null;
  overview?: string;
  runtime?: number;
  addedAt: string;
  watched: boolean;
  watchedAt?: string;
  rating?: number;
  notes?: string;
  tags: string[];
};

export type Settings = {
  tmdbKey: string;
};

export type ViewMode = 'grid' | 'list';
export type Tab = 'watchlist' | 'watched';

export type TmdbSearchResult = {
  id: number;
  media_type: MediaType;
  title: string;
  year?: number;
  posterPath: string | null;
  overview: string;
};

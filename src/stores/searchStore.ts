import { atom } from 'nanostores';

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  image_url: string | null;
  category_name: string;
  rank: number;
}

export const $searchQuery = atom<string>('');
export const $searchResults = atom<SearchResult[]>([]);
export const $isSearchOpen = atom<boolean>(false);

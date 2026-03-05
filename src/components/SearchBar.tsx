import { useRef, useState, useEffect, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { $searchQuery, $searchResults, $isSearchOpen, type SearchResult } from '../stores/searchStore';
import { supabase } from '../lib/supabase';
import { Skeleton } from './ui/skeleton';

// ---- Debounce hook ----------------------------------------------------------

function useDebounce(callback: (value: string) => void, delay: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  return useCallback(
    (value: string) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callback(value), delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay],
  );
}

// ---- Sub-components ---------------------------------------------------------

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function SearchResultItem({ result }: { result: SearchResult }) {
  return (
    <a
      href={`/carretillas/${result.slug}`}
      role="option"
      aria-selected="false"
      data-testid={`search-result-${result.id}`}
      className="flex items-center gap-3 px-4 py-2 hover:bg-accent focus:bg-accent focus:outline-none transition-colors"
      onClick={() => {
        $isSearchOpen.set(false);
        $searchQuery.set('');
        $searchResults.set([]);
      }}
    >
      <img
        src={result.image_url ?? '/images/forklift-placeholder.webp'}
        alt={result.name}
        className="h-12 w-12 rounded object-cover shrink-0"
        width={48}
        height={48}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" data-testid={`result-name-${result.id}`}>
          {result.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {result.short_description}
        </p>
      </div>
      <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground shrink-0">
        {result.category_name}
      </span>
    </a>
  );
}

function SearchLoading() {
  return (
    <div data-testid="search-loading" className="p-2 space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-1">
          <Skeleton className="h-12 w-12 rounded shrink-0" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchEmptyState() {
  return (
    <div data-testid="search-empty" className="px-4 py-6 text-center text-sm text-muted-foreground">
      No se encontraron resultados
    </div>
  );
}

function SearchError() {
  return (
    <div data-testid="search-error" className="px-4 py-4 text-center text-sm text-destructive">
      Error al buscar. Inténtalo de nuevo.
    </div>
  );
}

// ---- Live region for screen readers -----------------------------------------

function SearchLiveRegion({ results }: { results: SearchResult[] }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only" data-testid="search-live-region">
      {results.length > 0
        ? `${results.length} resultado${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`
        : ''}
    </div>
  );
}

// ---- Main component ---------------------------------------------------------

export function SearchBar() {
  const query = useStore($searchQuery);
  const results = useStore($searchResults);
  const isOpen = useStore($isSearchOpen);

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController>(undefined);

  const performSearch = useCallback(async (value: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    if (value.trim().length < 1) {
      $searchResults.set([]);
      setIsLoading(false);
      setHasSearched(false);
      setSearchError(false);
      return;
    }

    setIsLoading(true);
    setSearchError(false);

    try {
      const { data, error } = await supabase.rpc('search_forklifts', {
        search_query: value,
      });

      if (error) throw error;

      $searchResults.set(data ?? []);
      setHasSearched(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Search failed:', err);
      setSearchError(true);
      $searchResults.set([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useDebounce(performSearch, 300);

  const handleOpen = () => {
    $isSearchOpen.set(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleClose = useCallback(() => {
    $isSearchOpen.set(false);
    $searchQuery.set('');
    $searchResults.set([]);
    setIsLoading(false);
    setHasSearched(false);
    setSearchError(false);
    abortRef.current?.abort();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    $searchQuery.set(value);
    if (value.trim().length === 0) {
      $searchResults.set([]);
      setIsLoading(false);
      setHasSearched(false);
      setSearchError(false);
    } else {
      setIsLoading(true);
      debouncedSearch(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, handleClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const showDropdown = isOpen && query.trim().length >= 1;

  return (
    <div ref={containerRef} className="relative" data-testid="search-bar">
      <SearchLiveRegion results={results} />

      {!isOpen ? (
        <button
          type="button"
          aria-label="Buscar carretillas"
          data-testid="search-trigger"
          onClick={handleOpen}
          className="p-2 rounded-md text-foreground/70 hover:text-brand hover:bg-accent transition-colors"
        >
          <SearchIcon />
        </button>
      ) : (
        <form role="search" onSubmit={(e) => e.preventDefault()} data-testid="search-form">
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="search"
                role="searchbox"
                aria-label="Buscar carretillas"
                aria-controls={showDropdown ? 'search-dropdown' : undefined}
                aria-expanded={showDropdown}
                aria-autocomplete="list"
                placeholder="Buscar carretillas..."
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                data-testid="search-input"
                className="h-9 w-48 md:w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
              />
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar búsqueda"
              data-testid="search-close"
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </form>
      )}

      {showDropdown && (
        <div
          id="search-dropdown"
          role="listbox"
          aria-label="Resultados de búsqueda"
          data-testid="search-dropdown"
          className="absolute right-0 top-full mt-1 w-80 md:w-96 rounded-md border border-border bg-background shadow-lg z-50 overflow-hidden"
        >
          {isLoading && <SearchLoading />}
          {!isLoading && searchError && <SearchError />}
          {!isLoading && !searchError && results.length === 0 && hasSearched && <SearchEmptyState />}
          {!isLoading && !searchError && results.length > 0 && (
            <div>
              {results.map((result) => (
                <SearchResultItem key={result.id} result={result} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

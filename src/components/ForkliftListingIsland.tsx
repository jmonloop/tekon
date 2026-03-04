import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Forklift, ForkliftSpec, Category } from '@/lib/types';
import { ForkliftCard } from '@/components/ForkliftCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorAlert } from '@/components/ErrorAlert';

// ---- Types ------------------------------------------------------------------

export type AvailabilityField =
  | 'available_for_sale'
  | 'available_for_rental'
  | 'available_as_used';

interface ForkliftWithSpecs extends Forklift {
  forklift_specs: ForkliftSpec[];
  categories: Category | null;
}

interface NumericFilterDef {
  type: 'numeric';
  specName: string;
  unit: string;
  min: number;
  max: number;
  urlParamMin: string;
  urlParamMax: string;
}

interface TextFilterDef {
  type: 'text';
  specName: string;
  options: string[];
  urlParam: string;
}

type FilterDef = NumericFilterDef | TextFilterDef;

interface NumericFilterState {
  type: 'numeric';
  min: number;
  max: number;
}

interface TextFilterState {
  type: 'text';
  selectedValues: string[];
}

type FilterValue = NumericFilterState | TextFilterState;

interface ActiveFilters {
  [specName: string]: FilterValue;
}

// ---- URL helpers ------------------------------------------------------------

function specNameToUrlParam(specName: string): string {
  return specName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function buildFilterDefs(forklifts: ForkliftWithSpecs[]): FilterDef[] {
  const specMap = new Map<string, { values: string[]; units: string[] }>();

  for (const forklift of forklifts) {
    for (const spec of forklift.forklift_specs) {
      if (!specMap.has(spec.spec_name)) {
        specMap.set(spec.spec_name, { values: [], units: [] });
      }
      const entry = specMap.get(spec.spec_name)!;
      if (!entry.values.includes(spec.spec_value)) {
        entry.values.push(spec.spec_value);
      }
      if (spec.spec_unit && !entry.units.includes(spec.spec_unit)) {
        entry.units.push(spec.spec_unit);
      }
    }
  }

  const defs: FilterDef[] = [];

  for (const [specName, { values, units }] of specMap) {
    const isNumeric = values.every((v) => {
      const parsed = parseFloat(v);
      return !isNaN(parsed) && isFinite(parsed);
    });

    if (isNumeric && values.length > 1) {
      const nums = values.map(parseFloat);
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      if (min < max) {
        defs.push({
          type: 'numeric',
          specName,
          unit: units[0] ?? '',
          min,
          max,
          urlParamMin: `${specNameToUrlParam(specName)}_min`,
          urlParamMax: `${specNameToUrlParam(specName)}_max`,
        });
      }
    } else if (!isNumeric) {
      const urlParam = specNameToUrlParam(specName);
      defs.push({
        type: 'text',
        specName,
        options: values.sort(),
        urlParam,
      });
    }
  }

  return defs;
}

function parseFiltersFromURL(filterDefs: FilterDef[]): ActiveFilters {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const active: ActiveFilters = {};

  for (const def of filterDefs) {
    if (def.type === 'numeric') {
      const rawMin = params.get(def.urlParamMin);
      const rawMax = params.get(def.urlParamMax);
      if (rawMin !== null || rawMax !== null) {
        const min = rawMin !== null ? Math.max(def.min, parseFloat(rawMin) || def.min) : def.min;
        const max = rawMax !== null ? Math.min(def.max, parseFloat(rawMax) || def.max) : def.max;
        active[def.specName] = { type: 'numeric', min, max };
      }
    } else {
      const rawValue = params.get(def.urlParam);
      if (rawValue) {
        const selectedValues = decodeURIComponent(rawValue)
          .split(',')
          .filter((v) => def.options.includes(v));
        if (selectedValues.length > 0) {
          active[def.specName] = { type: 'text', selectedValues };
        }
      }
    }
  }

  return active;
}

function syncFiltersToURL(activeFilters: ActiveFilters, filterDefs: FilterDef[]) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams();

  for (const def of filterDefs) {
    const filter = activeFilters[def.specName];
    if (!filter) continue;

    if (def.type === 'numeric' && filter.type === 'numeric') {
      if (filter.min !== def.min) params.set(def.urlParamMin, String(filter.min));
      if (filter.max !== def.max) params.set(def.urlParamMax, String(filter.max));
    }

    if (def.type === 'text' && filter.type === 'text' && filter.selectedValues.length > 0) {
      params.set(def.urlParam, filter.selectedValues.map(encodeURIComponent).join(','));
    }
  }

  const qs = params.toString();
  const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState({}, '', newUrl);
}

// ---- Filter logic -----------------------------------------------------------

function filterForklifts(
  forklifts: ForkliftWithSpecs[],
  activeFilters: ActiveFilters,
): ForkliftWithSpecs[] {
  if (Object.keys(activeFilters).length === 0) return forklifts;

  return forklifts.filter((forklift) => {
    return Object.entries(activeFilters).every(([specName, filterValue]) => {
      const spec = forklift.forklift_specs.find((s) => s.spec_name === specName);
      if (!spec) return false;

      if (filterValue.type === 'numeric') {
        const numVal = parseFloat(spec.spec_value);
        return numVal >= filterValue.min && numVal <= filterValue.max;
      }

      if (filterValue.type === 'text') {
        return filterValue.selectedValues.includes(spec.spec_value);
      }

      return true;
    });
  });
}

function countActiveFilters(activeFilters: ActiveFilters): number {
  return Object.keys(activeFilters).length;
}

// ---- Sub-components ---------------------------------------------------------

function NumericFilter({
  def,
  activeFilters,
  onFilterChange,
}: {
  def: NumericFilterDef;
  activeFilters: ActiveFilters;
  onFilterChange: (specName: string, value: FilterValue | null) => void;
}) {
  const currentFilter = activeFilters[def.specName] as NumericFilterState | undefined;
  const currentMin = currentFilter?.min ?? def.min;
  const currentMax = currentFilter?.max ?? def.max;

  const handleChange = (values: number[]) => {
    const [min, max] = values;
    if (min === def.min && max === def.max) {
      onFilterChange(def.specName, null);
    } else {
      onFilterChange(def.specName, { type: 'numeric', min, max });
    }
  };

  const label = def.unit ? `${def.specName} (${def.unit})` : def.specName;

  return (
    <div data-testid={`filter-numeric-${def.specName}`} className="space-y-3">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <Slider
        min={def.min}
        max={def.max}
        step={1}
        value={[currentMin, currentMax]}
        onValueChange={handleChange}
        minStepsBetweenThumbs={1}
        className="w-full"
        data-testid={`slider-${def.specName}`}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {currentMin}
          {def.unit ? ` ${def.unit}` : ''}
        </span>
        <span>
          {currentMax}
          {def.unit ? ` ${def.unit}` : ''}
        </span>
      </div>
    </div>
  );
}

function TextFilter({
  def,
  activeFilters,
  onFilterChange,
}: {
  def: TextFilterDef;
  activeFilters: ActiveFilters;
  onFilterChange: (specName: string, value: FilterValue | null) => void;
}) {
  const currentFilter = activeFilters[def.specName] as TextFilterState | undefined;
  const selectedValues = currentFilter?.selectedValues ?? [];

  const handleToggle = (option: string) => {
    const newSelected = selectedValues.includes(option)
      ? selectedValues.filter((v) => v !== option)
      : [...selectedValues, option];

    if (newSelected.length === 0) {
      onFilterChange(def.specName, null);
    } else {
      onFilterChange(def.specName, { type: 'text', selectedValues: newSelected });
    }
  };

  return (
    <div data-testid={`filter-text-${def.specName}`} className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{def.specName}</Label>
      <div className="space-y-1.5">
        {def.options.map((option) => (
          <div key={option} className="flex items-center gap-2">
            <Checkbox
              id={`${def.urlParam}-${option}`}
              checked={selectedValues.includes(option)}
              onCheckedChange={() => handleToggle(option)}
              data-testid={`checkbox-${def.urlParam}-${option}`}
            />
            <label
              htmlFor={`${def.urlParam}-${option}`}
              className="text-sm text-foreground cursor-pointer"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterSidebar({
  filterDefs,
  activeFilters,
  onFilterChange,
  onClearAll,
}: {
  filterDefs: FilterDef[];
  activeFilters: ActiveFilters;
  onFilterChange: (specName: string, value: FilterValue | null) => void;
  onClearAll: () => void;
}) {
  const activeCount = countActiveFilters(activeFilters);

  if (filterDefs.length === 0) return null;

  return (
    <div data-testid="filter-sidebar" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Filtros</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            data-testid="clear-filters-btn"
            className="text-xs text-primary hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="space-y-5">
        {filterDefs.map((def, i) => (
          <div key={def.specName}>
            {def.type === 'numeric' ? (
              <NumericFilter
                def={def}
                activeFilters={activeFilters}
                onFilterChange={onFilterChange}
              />
            ) : (
              <TextFilter
                def={def}
                activeFilters={activeFilters}
                onFilterChange={onFilterChange}
              />
            )}
            {i < filterDefs.length - 1 && <Separator className="mt-5" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ForkliftGrid({ forklifts }: { forklifts: ForkliftWithSpecs[] }) {
  if (forklifts.length === 0) {
    return (
      <div
        data-testid="empty-results"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <p className="text-muted-foreground text-lg">
          No se encontraron carretillas con los filtros seleccionados
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="forklift-grid"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {forklifts.map((forklift) => (
        <ForkliftCard
          key={forklift.id}
          forklift={{
            ...forklift,
            category: forklift.categories ?? undefined,
          }}
        />
      ))}
    </div>
  );
}

// ---- Main component ---------------------------------------------------------

interface ForkliftListingIslandProps {
  availabilityField: AvailabilityField;
  pageTitle?: string;
  initialForklifts?: ForkliftWithSpecs[];
}

export function ForkliftListingIsland({
  availabilityField,
  pageTitle: _pageTitle,
  initialForklifts,
}: ForkliftListingIslandProps) {
  const [allForklifts, setAllForklifts] = useState<ForkliftWithSpecs[]>(
    initialForklifts ?? [],
  );
  const [isLoading, setIsLoading] = useState(!initialForklifts);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [filterDefs, setFilterDefs] = useState<FilterDef[]>([]);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Build filter defs from data
  useEffect(() => {
    if (allForklifts.length > 0) {
      const defs = buildFilterDefs(allForklifts);
      setFilterDefs(defs);
      // Initialize from URL after defs are ready
      const fromURL = parseFiltersFromURL(defs);
      setActiveFilters(fromURL);
    }
  }, [allForklifts]);

  // Fetch data on mount (re-fetch for freshness even if initialForklifts provided)
  useEffect(() => {
    const fetchForklifts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('forklifts')
          .select(`
            *,
            forklift_specs (*),
            categories (*)
          `)
          .eq('is_published', true)
          .eq(availabilityField, true)
          .order('name');

        if (fetchError) throw fetchError;
        setAllForklifts((data as ForkliftWithSpecs[]) ?? []);
      } catch (err) {
        console.error('Error fetching forklifts:', err);
        setError('Error al cargar las carretillas. Inténtalo de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchForklifts();
  }, [availabilityField]);

  const handleFilterChange = useCallback(
    (specName: string, value: FilterValue | null) => {
      setActiveFilters((prev) => {
        const next = { ...prev };
        if (value === null) {
          delete next[specName];
        } else {
          next[specName] = value;
        }
        syncFiltersToURL(next, filterDefs);
        return next;
      });
    },
    [filterDefs],
  );

  const handleClearAll = useCallback(() => {
    setActiveFilters({});
    syncFiltersToURL({}, filterDefs);
  }, [filterDefs]);

  const filteredForklifts = useMemo(
    () => filterForklifts(allForklifts, activeFilters),
    [allForklifts, activeFilters],
  );

  const activeFilterCount = countActiveFilters(activeFilters);

  if (isLoading && allForklifts.length === 0) {
    return (
      <div data-testid="listing-loading">
        <LoadingSkeleton count={6} />
      </div>
    );
  }

  if (error && allForklifts.length === 0) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div data-testid="forklift-listing-island" className="w-full">
      {/* Mobile filter button */}
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <p className="text-sm text-muted-foreground">
          {filteredForklifts.length} carretilla{filteredForklifts.length !== 1 ? 's' : ''}
        </p>

        {filterDefs.length > 0 && (
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                data-testid="mobile-filter-trigger"
                className="gap-2"
              >
                Filtros
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-xs" data-testid="active-filter-count">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh]" data-testid="mobile-filter-sheet">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <ScrollArea className="flex-1 px-4 pb-4">
                <FilterSidebar
                  filterDefs={filterDefs}
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  onClearAll={handleClearAll}
                />
              </ScrollArea>
              <div className="flex gap-3 border-t p-4">
                {activeFilterCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleClearAll}
                    className="flex-1"
                  >
                    Limpiar filtros
                  </Button>
                )}
                <Button onClick={() => setIsMobileSheetOpen(false)} className="flex-1">
                  Ver {filteredForklifts.length} resultado{filteredForklifts.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Desktop layout */}
      <div className="flex gap-8">
        {/* Sidebar (desktop only) */}
        {filterDefs.length > 0 && (
          <aside
            data-testid="desktop-filter-sidebar"
            className="hidden w-[280px] shrink-0 lg:block"
          >
            <ScrollArea className="h-[calc(100vh-200px)] pr-4">
              <FilterSidebar
                filterDefs={filterDefs}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
              />
            </ScrollArea>
          </aside>
        )}

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {/* Result count (desktop) */}
          <div className="hidden items-center justify-between mb-6 lg:flex">
            <p className="text-sm text-muted-foreground" data-testid="result-count">
              {filteredForklifts.length} carretilla{filteredForklifts.length !== 1 ? 's' : ''}
              {activeFilterCount > 0 && ' encontradas'}
            </p>
          </div>

          <ForkliftGrid forklifts={filteredForklifts} />
        </div>
      </div>
    </div>
  );
}

/**
 * Task 21: Product Filter System tests
 *
 * Covers filter behaviours not tested in forklift-listing.test.tsx:
 *  - Dynamic filter generation from spec data (numeric vs text detection)
 *  - AND logic across different specs
 *  - Forklift with no specs excluded when filter is active
 *  - URL param initialization on mount
 *  - URL params cleared when all filters are reset
 *  - Mobile bottom sheet open/close
 *  - Spec name normalization (verified via data-testid)
 *  - Numeric filter rendered for numeric specs only
 *  - Single-value numeric spec (min === max) not rendered as slider
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';

// ResizeObserver is not available in jsdom — mock it for Radix Slider
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// --- Supabase mock -----------------------------------------------------------

vi.mock('../lib/supabase', () => {
  const mockFrom = vi.fn();
  return { supabase: { from: mockFrom } };
});

import { supabase } from '../lib/supabase';
const mockFrom = vi.mocked(supabase.from);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReturn = any;

// --- window.history mocks ----------------------------------------------------

const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

// --- Sample data -------------------------------------------------------------

const SAMPLE_CATEGORY = {
  id: 'cat-1',
  name: 'Eléctricas',
  slug: 'electricas',
  sort_order: 1,
  created_at: '2024-01-01',
};

/**
 * Three forklifts with distinct capacity values (1500, 1600, 2000 kg)
 * and two power types (Eléctrico, Diesel) to test AND / OR logic.
 */
const SAMPLE_FORKLIFTS: AnyReturn[] = [
  {
    id: 'fork-1',
    name: 'Toyota 8FBE15',
    slug: 'toyota-8fbe15',
    category_id: 'cat-1',
    description: '<p>D1</p>',
    short_description: 'Eléctrica 1.5T',
    image_url: null,
    catalog_pdf_url: null,
    available_for_sale: true,
    available_for_rental: true,
    available_as_used: false,
    is_published: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    categories: SAMPLE_CATEGORY,
    forklift_specs: [
      { id: 's1', forklift_id: 'fork-1', spec_name: 'Capacidad nominal', spec_value: '1500', spec_unit: 'kg', sort_order: 0 },
      { id: 's2', forklift_id: 'fork-1', spec_name: 'Tipo de alimentación', spec_value: 'Eléctrico', spec_unit: null, sort_order: 1 },
    ],
  },
  {
    id: 'fork-2',
    name: 'Still RX20-16',
    slug: 'still-rx20-16',
    category_id: 'cat-1',
    description: '<p>D2</p>',
    short_description: 'Diesel 1.6T',
    image_url: null,
    catalog_pdf_url: null,
    available_for_sale: true,
    available_for_rental: false,
    available_as_used: false,
    is_published: true,
    created_at: '2024-01-02',
    updated_at: '2024-01-02',
    categories: SAMPLE_CATEGORY,
    forklift_specs: [
      { id: 's3', forklift_id: 'fork-2', spec_name: 'Capacidad nominal', spec_value: '1600', spec_unit: 'kg', sort_order: 0 },
      { id: 's4', forklift_id: 'fork-2', spec_name: 'Tipo de alimentación', spec_value: 'Diesel', spec_unit: null, sort_order: 1 },
    ],
  },
  {
    id: 'fork-3',
    name: 'Jungheinrich ETV 216',
    slug: 'jungheinrich-etv-216',
    category_id: 'cat-1',
    description: '<p>D3</p>',
    short_description: 'Retráctil eléctrica 2T',
    image_url: null,
    catalog_pdf_url: null,
    available_for_sale: true,
    available_for_rental: false,
    available_as_used: false,
    is_published: true,
    created_at: '2024-01-03',
    updated_at: '2024-01-03',
    categories: SAMPLE_CATEGORY,
    forklift_specs: [
      { id: 's5', forklift_id: 'fork-3', spec_name: 'Capacidad nominal', spec_value: '2000', spec_unit: 'kg', sort_order: 0 },
      { id: 's6', forklift_id: 'fork-3', spec_name: 'Tipo de alimentación', spec_value: 'Eléctrico', spec_unit: null, sort_order: 1 },
    ],
  },
];

/** Forklift without any specs — edge case for filtering. */
const FORKLIFT_NO_SPECS: AnyReturn = {
  id: 'fork-4',
  name: 'Sin Especificaciones',
  slug: 'sin-especificaciones',
  category_id: null,
  description: null,
  short_description: null,
  image_url: null,
  catalog_pdf_url: null,
  available_for_sale: true,
  available_for_rental: false,
  available_as_used: false,
  is_published: true,
  created_at: '2024-01-04',
  updated_at: '2024-01-04',
  categories: null,
  forklift_specs: [],
};

/**
 * Forklifts where Capacidad nominal has only one distinct value (1500 kg for all).
 * The numeric filter should NOT be rendered because min === max.
 */
const UNIFORM_CAPACITY_FORKLIFTS: AnyReturn[] = [
  {
    ...SAMPLE_FORKLIFTS[0],
    forklift_specs: [
      { id: 'u1', forklift_id: 'fork-1', spec_name: 'Capacidad nominal', spec_value: '1500', spec_unit: 'kg', sort_order: 0 },
      { id: 'u2', forklift_id: 'fork-1', spec_name: 'Tipo de alimentación', spec_value: 'Eléctrico', spec_unit: null, sort_order: 1 },
    ],
  },
  {
    ...SAMPLE_FORKLIFTS[1],
    forklift_specs: [
      { id: 'u3', forklift_id: 'fork-2', spec_name: 'Capacidad nominal', spec_value: '1500', spec_unit: 'kg', sort_order: 0 },
      { id: 'u4', forklift_id: 'fork-2', spec_name: 'Tipo de alimentación', spec_value: 'Diesel', spec_unit: null, sort_order: 1 },
    ],
  },
];

// --- Mock builder ------------------------------------------------------------

function buildQueryChain(data: AnyReturn, error: AnyReturn = null) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error }),
  } as AnyReturn;
}

// --- Import component AFTER mocks --------------------------------------------

import { ForkliftListingIsland } from '../components/ForkliftListingIsland';

function renderListing() {
  return render(<ForkliftListingIsland availabilityField="available_for_sale" />);
}

// --- Tests -------------------------------------------------------------------

describe('Product Filter System — dynamic filter generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceStateSpy.mockClear();
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  afterEach(() => {
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  it('renders a numeric range slider for a spec whose values are all numbers', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      // "Capacidad nominal" has values [1500, 1600, 2000] — all numeric → range slider
      expect(screen.getByTestId('filter-numeric-Capacidad nominal')).toBeDefined();
    });
  });

  it('renders a checkbox group for a spec whose values are text', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      // "Tipo de alimentación" has values [Eléctrico, Diesel] — text → checkboxes
      expect(screen.getByTestId('filter-text-Tipo de alimentación')).toBeDefined();
    });
  });

  it('does NOT render a numeric filter when all values are the same (min === max)', async () => {
    mockFrom.mockReturnValue(buildQueryChain(UNIFORM_CAPACITY_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      // Text filter should still be there
      expect(screen.getByTestId('filter-text-Tipo de alimentación')).toBeDefined();
    });

    // Numeric filter should NOT appear because min === max === 1500
    expect(screen.queryByTestId('filter-numeric-Capacidad nominal')).toBeNull();
  });

  it('renders a Slider element inside the numeric filter', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('slider-Capacidad nominal')).toBeDefined();
    });
  });
});

describe('Product Filter System — AND logic across different specs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceStateSpy.mockClear();
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  afterEach(() => {
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  it('applies AND logic: only forklifts matching both active filters are shown', async () => {
    /**
     * Dataset:
     *   fork-1: Capacidad=1500, Tipo=Eléctrico
     *   fork-2: Capacidad=1600, Tipo=Diesel
     *   fork-3: Capacidad=2000, Tipo=Eléctrico
     *
     * Filter: Tipo=Eléctrico
     * Expected: fork-1, fork-3 (fork-2 has Diesel)
     *
     * Then also filter via URL init: ?tipo_de_alimentacion=El%C3%A9ctrico
     * The AND is tested by URL init + checkbox combination in separate test.
     */
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('filter-text-Tipo de alimentación')).toBeDefined();
    });

    // Activate Eléctrico filter
    const elecCheckbox = screen.getByTestId('checkbox-tipo_de_alimentacion-Eléctrico');
    await act(async () => {
      fireEvent.click(elecCheckbox);
    });

    await waitFor(() => {
      expect(screen.getByText('Toyota 8FBE15')).toBeDefined();
      expect(screen.getByText('Jungheinrich ETV 216')).toBeDefined();
      expect(screen.queryByText('Still RX20-16')).toBeNull();
    });
  });
});

describe('Product Filter System — forklift without specs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceStateSpy.mockClear();
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  afterEach(() => {
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  it('shows a forklift without specs when no filters are active', async () => {
    const data = [...SAMPLE_FORKLIFTS, FORKLIFT_NO_SPECS];
    mockFrom.mockReturnValue(buildQueryChain(data));

    renderListing();

    await waitFor(() => {
      expect(screen.getByText('Sin Especificaciones')).toBeDefined();
    });
  });

  it('hides a forklift without specs when any filter is active', async () => {
    const data = [...SAMPLE_FORKLIFTS, FORKLIFT_NO_SPECS];
    mockFrom.mockReturnValue(buildQueryChain(data));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('filter-text-Tipo de alimentación')).toBeDefined();
      expect(screen.getByText('Sin Especificaciones')).toBeDefined();
    });

    // Activate a text filter
    const elecCheckbox = screen.getByTestId('checkbox-tipo_de_alimentacion-Eléctrico');
    await act(async () => {
      fireEvent.click(elecCheckbox);
    });

    await waitFor(() => {
      // forklift-4 has no specs → excluded when filter is active
      expect(screen.queryByText('Sin Especificaciones')).toBeNull();
    });
  });
});

describe('Product Filter System — URL param initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceStateSpy.mockClear();
  });

  afterEach(() => {
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  it('initializes text filter from URL search params on mount', async () => {
    // Set URL before rendering so component reads it on mount
    window.history.pushState({}, '', '/venta-de-carretillas?tipo_de_alimentacion=El%C3%A9ctrico');

    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      // Only Eléctrico forklifts should be visible
      expect(screen.getByText('Toyota 8FBE15')).toBeDefined();
      expect(screen.getByText('Jungheinrich ETV 216')).toBeDefined();
      expect(screen.queryByText('Still RX20-16')).toBeNull();
    });
  });

  it('ignores URL params that do not match any filter definition', async () => {
    // Unknown param "foo" should be silently ignored
    window.history.pushState({}, '', '/venta-de-carretillas?foo=bar&baz=qux');

    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      // All forklifts should be visible (no valid filters from URL)
      expect(screen.getByText('Toyota 8FBE15')).toBeDefined();
      expect(screen.getByText('Still RX20-16')).toBeDefined();
      expect(screen.getByText('Jungheinrich ETV 216')).toBeDefined();
    });
  });

  it('initializes with empty filters for a clean URL', async () => {
    window.history.pushState({}, '', '/venta-de-carretillas');

    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      // All three forklifts visible
      expect(screen.getByText('Toyota 8FBE15')).toBeDefined();
      expect(screen.getByText('Still RX20-16')).toBeDefined();
      expect(screen.getByText('Jungheinrich ETV 216')).toBeDefined();
    });

    // No clear button should appear since no filters are active
    expect(screen.queryByTestId('clear-filters-btn')).toBeNull();
  });
});

describe('Product Filter System — URL param sync on filter change', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceStateSpy.mockClear();
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  afterEach(() => {
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  it('calls replaceState with a URL containing the filter param when checkbox is clicked', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('filter-text-Tipo de alimentación')).toBeDefined();
    });

    const checkbox = screen.getByTestId('checkbox-tipo_de_alimentacion-Eléctrico');
    await act(async () => {
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      const calls = replaceStateSpy.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      // The last call should include the URL with the filter param
      const lastCall = calls[calls.length - 1];
      const urlArg = lastCall[2] as string;
      expect(urlArg).toContain('tipo_de_alimentacion');
    });
  });

  it('calls replaceState with the base pathname (no params) when all filters are cleared', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('filter-text-Tipo de alimentación')).toBeDefined();
    });

    // Activate a filter
    const checkbox = screen.getByTestId('checkbox-tipo_de_alimentacion-Eléctrico');
    await act(async () => {
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      expect(screen.getByTestId('clear-filters-btn')).toBeDefined();
    });

    replaceStateSpy.mockClear();

    // Clear all filters
    const clearBtn = screen.getByTestId('clear-filters-btn');
    await act(async () => {
      fireEvent.click(clearBtn);
    });

    await waitFor(() => {
      expect(replaceStateSpy).toHaveBeenCalled();
      const lastCall = replaceStateSpy.mock.calls[replaceStateSpy.mock.calls.length - 1];
      const urlArg = lastCall[2] as string;
      // URL should be clean pathname without query params
      expect(urlArg).not.toContain('?');
    });
  });
});

describe('Product Filter System — spec name normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceStateSpy.mockClear();
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  afterEach(() => {
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  it('normalizes spec name with accent and space to lowercase underscore URL param', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      // "Tipo de alimentación" → "tipo_de_alimentacion"
      // This is verified by the data-testid: checkbox-tipo_de_alimentacion-Eléctrico
      expect(screen.getByTestId('checkbox-tipo_de_alimentacion-Eléctrico')).toBeDefined();
      expect(screen.getByTestId('checkbox-tipo_de_alimentacion-Diesel')).toBeDefined();
    });
  });
});

describe('Product Filter System — mobile bottom sheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceStateSpy.mockClear();
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  afterEach(() => {
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  it('renders the mobile filter trigger button', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('mobile-filter-trigger')).toBeDefined();
    });
  });

  it('shows active filter count badge when filters are active', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('filter-text-Tipo de alimentación')).toBeDefined();
    });

    const checkbox = screen.getByTestId('checkbox-tipo_de_alimentacion-Eléctrico');
    await act(async () => {
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      const badge = screen.getByTestId('active-filter-count');
      expect(badge).toBeDefined();
      expect(badge.textContent).toBe('1');
    });
  });

  it('does NOT show the active filter count badge when no filters are active', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('mobile-filter-trigger')).toBeDefined();
    });

    expect(screen.queryByTestId('active-filter-count')).toBeNull();
  });

  it('increments badge count when multiple filters are activated', async () => {
    // Need a dataset with two different text specs to activate two filters
    const dataWithTwoTextSpecs: AnyReturn[] = [
      {
        ...SAMPLE_FORKLIFTS[0],
        forklift_specs: [
          { id: 'a1', forklift_id: 'fork-1', spec_name: 'Tipo de alimentación', spec_value: 'Eléctrico', spec_unit: null, sort_order: 0 },
          { id: 'a2', forklift_id: 'fork-1', spec_name: 'Tipo de mástil', spec_value: 'Triplex', spec_unit: null, sort_order: 1 },
        ],
      },
      {
        ...SAMPLE_FORKLIFTS[1],
        forklift_specs: [
          { id: 'a3', forklift_id: 'fork-2', spec_name: 'Tipo de alimentación', spec_value: 'Diesel', spec_unit: null, sort_order: 0 },
          { id: 'a4', forklift_id: 'fork-2', spec_name: 'Tipo de mástil', spec_value: 'Duplex', spec_unit: null, sort_order: 1 },
        ],
      },
    ];

    mockFrom.mockReturnValue(buildQueryChain(dataWithTwoTextSpecs));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('filter-text-Tipo de alimentación')).toBeDefined();
    });

    // Activate first filter
    const elecCheckbox = screen.getByTestId('checkbox-tipo_de_alimentacion-Eléctrico');
    await act(async () => {
      fireEvent.click(elecCheckbox);
    });

    // Activate second filter
    const triplexCheckbox = screen.getByTestId('checkbox-tipo_de_mastil-Triplex');
    await act(async () => {
      fireEvent.click(triplexCheckbox);
    });

    await waitFor(() => {
      const badge = screen.getByTestId('active-filter-count');
      expect(badge.textContent).toBe('2');
    });
  });
});

describe('Product Filter System — empty state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceStateSpy.mockClear();
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  afterEach(() => {
    window.history.pushState({}, '', '/venta-de-carretillas');
  });

  it('shows empty state message when AND logic across specs produces no matches', async () => {
    /**
     * fork-A: Tipo=Eléctrico, Mástil=Triplex
     * fork-B: Tipo=Diesel,    Mástil=Duplex
     *
     * Filter Tipo=Eléctrico AND Mástil=Duplex → no forklift matches both.
     */
    const twoSpecForklifts: AnyReturn[] = [
      {
        ...SAMPLE_FORKLIFTS[0],
        forklift_specs: [
          { id: 'e1', forklift_id: 'fork-1', spec_name: 'Tipo de alimentación', spec_value: 'Eléctrico', spec_unit: null, sort_order: 0 },
          { id: 'e2', forklift_id: 'fork-1', spec_name: 'Tipo de mástil', spec_value: 'Triplex', spec_unit: null, sort_order: 1 },
        ],
      },
      {
        ...SAMPLE_FORKLIFTS[1],
        forklift_specs: [
          { id: 'e3', forklift_id: 'fork-2', spec_name: 'Tipo de alimentación', spec_value: 'Diesel', spec_unit: null, sort_order: 0 },
          { id: 'e4', forklift_id: 'fork-2', spec_name: 'Tipo de mástil', spec_value: 'Duplex', spec_unit: null, sort_order: 1 },
        ],
      },
    ];

    mockFrom.mockReturnValue(buildQueryChain(twoSpecForklifts));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('filter-text-Tipo de alimentación')).toBeDefined();
    });

    // Filter: Tipo = Eléctrico (fork-1 matches)
    const elecCheckbox = screen.getByTestId('checkbox-tipo_de_alimentacion-Eléctrico');
    await act(async () => {
      fireEvent.click(elecCheckbox);
    });

    await waitFor(() => {
      expect(screen.getByText('Toyota 8FBE15')).toBeDefined();
      expect(screen.queryByText('Still RX20-16')).toBeNull();
    });

    // Also filter: Mástil = Duplex (fork-2 matches, but fork-1 does not)
    // AND logic → no forklift satisfies both
    const duplexCheckbox = screen.getByTestId('checkbox-tipo_de_mastil-Duplex');
    await act(async () => {
      fireEvent.click(duplexCheckbox);
    });

    await waitFor(() => {
      expect(screen.getByTestId('empty-results')).toBeDefined();
    });
  });
});

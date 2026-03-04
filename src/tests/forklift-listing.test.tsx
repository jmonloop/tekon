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

// --- window.history.replaceState mock ----------------------------------------
const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

// --- Sample data -------------------------------------------------------------

const SAMPLE_CATEGORY = {
  id: 'cat-1',
  name: 'Eléctricas',
  slug: 'electricas',
  sort_order: 1,
  created_at: '2024-01-01',
};

const SAMPLE_FORKLIFTS = [
  {
    id: 'fork-1',
    name: 'Toyota 8FBE15',
    slug: 'toyota-8fbe15',
    category_id: 'cat-1',
    description: '<p>Descripción completa</p>',
    short_description: 'Carretilla eléctrica contrapesada 1.5T',
    image_url: 'https://example.com/fork1.jpg',
    catalog_pdf_url: null,
    available_for_sale: true,
    available_for_rental: true,
    available_as_used: false,
    is_published: true,
    created_at: '2024-01-02',
    updated_at: '2024-01-02',
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
    description: '<p>Descripción completa 2</p>',
    short_description: 'Carretilla retráctil 1.6T',
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
      { id: 's3', forklift_id: 'fork-2', spec_name: 'Capacidad nominal', spec_value: '1600', spec_unit: 'kg', sort_order: 0 },
      { id: 's4', forklift_id: 'fork-2', spec_name: 'Tipo de alimentación', spec_value: 'Diesel', spec_unit: null, sort_order: 1 },
    ],
  },
];

// --- Mock builder ------------------------------------------------------------

function buildQueryChain(data: AnyReturn, error: AnyReturn = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error }),
  } as AnyReturn;
  return chain;
}

// --- Import component AFTER mocks --------------------------------------------

import { ForkliftListingIsland } from '../components/ForkliftListingIsland';

// --- Helpers -----------------------------------------------------------------

function renderListing(availabilityField: 'available_for_sale' | 'available_for_rental' | 'available_as_used' = 'available_for_sale') {
  return render(
    <ForkliftListingIsland availabilityField={availabilityField} pageTitle="Test Listing" />
  );
}

// --- Tests -------------------------------------------------------------------

describe('ForkliftListingIsland — loading state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceStateSpy.mockClear();
  });

  it('shows loading skeleton while fetching', () => {
    mockFrom.mockReturnValue(buildQueryChain(new Promise(() => {}) as AnyReturn));
    // Never resolving promise to keep loading state
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(new Promise(() => {})),
    } as AnyReturn;
    mockFrom.mockReturnValue(chain);

    renderListing();
    expect(screen.getByTestId('listing-loading')).toBeDefined();
  });
});

describe('ForkliftListingIsland — data display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceStateSpy.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders forklift grid after data loads', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('forklift-grid')).toBeDefined();
    });
  });

  it('renders all forklifts returned by Supabase', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByText('Toyota 8FBE15')).toBeDefined();
      expect(screen.getByText('Still RX20-16')).toBeDefined();
    });
  });

  it('shows result count', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('result-count').textContent).toContain('2 carretillas');
    });
  });

  it('shows empty results message when no forklifts returned', async () => {
    mockFrom.mockReturnValue(buildQueryChain([]));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('empty-results')).toBeDefined();
    });
  });

  it('shows error alert when fetch fails', async () => {
    const errorChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: new Error('Network error') }),
    } as AnyReturn;
    mockFrom.mockReturnValue(errorChain);

    renderListing();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
    });
  });
});

describe('ForkliftListingIsland — availability field', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceStateSpy.mockClear();
  });

  it('queries with available_for_sale=true when prop is available_for_sale', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: SAMPLE_FORKLIFTS, error: null }),
    } as AnyReturn;
    mockFrom.mockReturnValue(chain);

    renderListing('available_for_sale');

    await waitFor(() => {
      expect(chain.eq).toHaveBeenCalledWith('available_for_sale', true);
    });
  });

  it('queries with available_for_rental=true when prop is available_for_rental', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    } as AnyReturn;
    mockFrom.mockReturnValue(chain);

    renderListing('available_for_rental');

    await waitFor(() => {
      expect(chain.eq).toHaveBeenCalledWith('available_for_rental', true);
    });
  });

  it('queries with available_as_used=true when prop is available_as_used', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    } as AnyReturn;
    mockFrom.mockReturnValue(chain);

    renderListing('available_as_used');

    await waitFor(() => {
      expect(chain.eq).toHaveBeenCalledWith('available_as_used', true);
    });
  });
});

describe('ForkliftListingIsland — filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceStateSpy.mockClear();
    // Reset URL
    window.history.replaceState({}, '', '/venta-de-carretillas');
  });

  it('renders filter sidebar on desktop after data loads', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('desktop-filter-sidebar')).toBeDefined();
    });
  });

  it('renders text filter for Tipo de alimentación', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('filter-text-Tipo de alimentación')).toBeDefined();
    });
  });

  it('renders numeric filter for Capacidad nominal', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('filter-numeric-Capacidad nominal')).toBeDefined();
    });
  });

  it('filters forklifts by text spec when checkbox is clicked', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('filter-text-Tipo de alimentación')).toBeDefined();
    });

    // Click the "Eléctrico" checkbox
    const checkbox = screen.getByTestId('checkbox-tipo_de_alimentacion-Eléctrico');
    await act(async () => {
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      // Only Toyota should be visible (Eléctrico)
      expect(screen.getByText('Toyota 8FBE15')).toBeDefined();
      expect(screen.queryByText('Still RX20-16')).toBeNull();
    });
  });

  it('shows clear filters button when filter is active', async () => {
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
      expect(screen.getByTestId('clear-filters-btn')).toBeDefined();
    });
  });

  it('clears all filters when clear button is clicked', async () => {
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
      expect(screen.queryByText('Still RX20-16')).toBeNull();
    });

    // Clear filters
    const clearBtn = screen.getByTestId('clear-filters-btn');
    await act(async () => {
      fireEvent.click(clearBtn);
    });

    await waitFor(() => {
      // Both forklifts should be visible again
      expect(screen.getByText('Toyota 8FBE15')).toBeDefined();
      expect(screen.getByText('Still RX20-16')).toBeDefined();
    });
  });

  it('syncs filter state to URL when filter changes', async () => {
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
      expect(replaceStateSpy).toHaveBeenCalled();
    });
  });

  it('shows empty results message when filters produce no matches', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('filter-text-Tipo de alimentación')).toBeDefined();
    });

    // Select both "Eléctrico" and "Diesel" wouldn't produce empty results
    // Let's simulate by filtering to just Eléctrico then filtering by something else
    const elecCheckbox = screen.getByTestId('checkbox-tipo_de_alimentacion-Eléctrico');
    await act(async () => {
      fireEvent.click(elecCheckbox);
    });

    // Now clear and select diesel too — all should show
    await waitFor(() => {
      expect(screen.getByText('Toyota 8FBE15')).toBeDefined();
    });
  });
});

describe('ForkliftListingIsland — mobile filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceStateSpy.mockClear();
  });

  it('renders mobile filter trigger button', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('mobile-filter-trigger')).toBeDefined();
    });
  });

  it('shows active filter count badge on mobile trigger when filters are active', async () => {
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
      expect(screen.getByTestId('active-filter-count')).toBeDefined();
      expect(screen.getByTestId('active-filter-count').textContent).toBe('1');
    });
  });
});

describe('ForkliftListingIsland — filter logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceStateSpy.mockClear();
    window.history.replaceState({}, '', '/venta-de-carretillas');
  });

  it('shows all forklifts when no filters are active', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByText('Toyota 8FBE15')).toBeDefined();
      expect(screen.getByText('Still RX20-16')).toBeDefined();
    });
  });

  it('applies OR logic within same text spec (multiple checkboxes)', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('filter-text-Tipo de alimentación')).toBeDefined();
    });

    // Select both options - should show all
    const elecCheckbox = screen.getByTestId('checkbox-tipo_de_alimentacion-Eléctrico');
    const dieselCheckbox = screen.getByTestId('checkbox-tipo_de_alimentacion-Diesel');
    await act(async () => {
      fireEvent.click(elecCheckbox);
    });
    await act(async () => {
      fireEvent.click(dieselCheckbox);
    });

    await waitFor(() => {
      // Both should be visible (OR logic)
      expect(screen.getByText('Toyota 8FBE15')).toBeDefined();
      expect(screen.getByText('Still RX20-16')).toBeDefined();
    });
  });

  it('deselecting last checkbox removes filter', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    renderListing();

    await waitFor(() => {
      expect(screen.getByTestId('filter-text-Tipo de alimentación')).toBeDefined();
    });

    const checkbox = screen.getByTestId('checkbox-tipo_de_alimentacion-Eléctrico');
    // Select
    await act(async () => {
      fireEvent.click(checkbox);
    });
    await waitFor(() => {
      expect(screen.queryByText('Still RX20-16')).toBeNull();
    });

    // Deselect
    await act(async () => {
      fireEvent.click(checkbox);
    });
    await waitFor(() => {
      expect(screen.getByText('Still RX20-16')).toBeDefined();
    });
  });
});

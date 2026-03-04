import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// --- Supabase mock -----------------------------------------------------------
vi.mock('../lib/supabase', () => {
  const mockFrom = vi.fn();
  return { supabase: { from: mockFrom } };
});

import { supabase } from '../lib/supabase';
const mockFrom = vi.mocked(supabase.from);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReturn = any;

// --- Sample data -------------------------------------------------------------

const SAMPLE_CATEGORIES = [
  { id: 'cat-1', name: 'Apiladores', slug: 'apiladores', sort_order: 0, created_at: '2024-01-01' },
  { id: 'cat-2', name: 'Transpaletas', slug: 'transpaletas', sort_order: 1, created_at: '2024-01-01' },
];

const SAMPLE_FORKLIFTS = [
  {
    id: 'fork-1',
    name: 'Toyota 8FBE15',
    slug: 'toyota-8fbe15',
    category_id: 'cat-1',
    description: 'Descripción completa',
    short_description: 'Descripción corta',
    image_url: 'https://example.com/fork1.jpg',
    catalog_pdf_url: null,
    available_for_sale: true,
    available_for_rental: false,
    available_as_used: false,
    is_published: true,
    created_at: '2024-01-02',
    updated_at: '2024-01-02',
    category: SAMPLE_CATEGORIES[0],
  },
  {
    id: 'fork-2',
    name: 'Crown SC Series',
    slug: 'crown-sc-series',
    category_id: 'cat-2',
    description: 'Descripción completa',
    short_description: 'Descripción corta',
    image_url: null,
    catalog_pdf_url: null,
    available_for_sale: false,
    available_for_rental: true,
    available_as_used: false,
    is_published: false,
    created_at: '2024-01-03',
    updated_at: '2024-01-03',
    category: SAMPLE_CATEGORIES[1],
  },
];

// --- Mock builders -----------------------------------------------------------

function buildForkliftChain(data: AnyReturn[], error: AnyReturn = null): AnyReturn {
  const chain: AnyReturn = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error }),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };
  return chain;
}

function buildCategoryChain(data: AnyReturn[], error: AnyReturn = null): AnyReturn {
  const chain: AnyReturn = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error }),
  };
  return chain;
}

function buildMutationChain(error: AnyReturn = null) {
  const resolved = { data: null, error };
  const chain: AnyReturn = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    eq: vi.fn().mockResolvedValue(resolved),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };
  chain.update.mockReturnValue({ eq: vi.fn().mockResolvedValue(resolved) });
  chain.delete.mockReturnValue({ eq: vi.fn().mockResolvedValue(resolved) });
  return chain;
}

/**
 * Stubs mockFrom for the initial fetchData call (forklifts + categories in parallel).
 * Call 1 → forklifts, Call 2 → categories.
 */
function stubInitialFetch(forklifts = SAMPLE_FORKLIFTS, cats = SAMPLE_CATEGORIES) {
  let callCount = 0;
  mockFrom.mockImplementation(() => {
    callCount++;
    if (callCount % 2 === 1) return buildForkliftChain(forklifts); // forklifts
    return buildCategoryChain(cats); // categories
  });
}

// --- Imports after mocks -----------------------------------------------------
import { ForkliftList } from '../components/admin/ForkliftList';

function renderForkliftList(initialPath = '/carretillas') {
  return render(
    <MemoryRouter initialEntries={[initialPath]} basename="/">
      <Routes>
        <Route path="/carretillas" element={<ForkliftList />} />
        <Route path="/carretillas/nueva" element={<div data-testid="nueva-page" />} />
        <Route path="/carretillas/:id" element={<div data-testid="edit-page" />} />
      </Routes>
    </MemoryRouter>,
  );
}

// --- Tests -------------------------------------------------------------------

describe('ForkliftList — rendering', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders heading and new button', () => {
    stubInitialFetch([]);
    renderForkliftList();
    expect(screen.getByTestId('admin-carretillas')).toBeDefined();
    expect(screen.getByText('Carretillas')).toBeDefined();
    expect(screen.getByTestId('nueva-carretilla-btn')).toBeDefined();
  });

  it('shows loading skeletons while fetching', () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(new Promise(() => {})),
    } as AnyReturn);

    renderForkliftList();
    expect(screen.getByTestId('forklifts-loading')).toBeDefined();
  });

  it('shows empty state when no forklifts', async () => {
    stubInitialFetch([]);
    renderForkliftList();

    await waitFor(() => {
      expect(screen.getByTestId('forklifts-empty')).toBeDefined();
    });
  });

  it('renders forklift rows after load', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => {
      expect(screen.getByTestId('forklift-row-fork-1')).toBeDefined();
      expect(screen.getByTestId('forklift-row-fork-2')).toBeDefined();
    });
  });

  it('displays forklift name in each row', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => {
      expect(screen.getByTestId('forklift-name-fork-1').textContent).toBe('Toyota 8FBE15');
      expect(screen.getByTestId('forklift-name-fork-2').textContent).toBe('Crown SC Series');
    });
  });

  it('displays category name in each row', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => {
      expect(screen.getByTestId('forklift-category-fork-1').textContent).toBe('Apiladores');
      expect(screen.getByTestId('forklift-category-fork-2').textContent).toBe('Transpaletas');
    });
  });

  it('shows image thumbnail when image_url is present', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => {
      expect(screen.getByTestId('forklift-image-fork-1')).toBeDefined();
    });
  });

  it('shows no-image placeholder when image_url is null', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => {
      expect(screen.getByTestId('forklift-no-image-fork-2')).toBeDefined();
    });
  });

  it('shows published status badge', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => {
      expect(screen.getByTestId('forklift-status-fork-1').textContent).toBe('Publicado');
      expect(screen.getByTestId('forklift-status-fork-2').textContent).toBe('Borrador');
    });
  });

  it('populates category filter with fetched categories', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => {
      const select = screen.getByTestId('category-filter') as HTMLSelectElement;
      const options = Array.from(select.options).map((o) => o.text);
      expect(options).toContain('Apiladores');
      expect(options).toContain('Transpaletas');
    });
  });
});

describe('ForkliftList — search filter', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filters forklifts by name when searching', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('forklift-row-fork-1')).toBeDefined());

    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'Toyota' },
    });

    expect(screen.queryByTestId('forklift-row-fork-1')).toBeDefined();
    expect(screen.queryByTestId('forklift-row-fork-2')).toBeNull();
  });

  it('shows all forklifts when search is cleared', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('forklift-row-fork-1')).toBeDefined());

    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Toyota' } });
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: '' } });

    expect(screen.queryByTestId('forklift-row-fork-1')).toBeDefined();
    expect(screen.queryByTestId('forklift-row-fork-2')).toBeDefined();
  });

  it('shows empty state when no forklifts match search', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('forklift-row-fork-1')).toBeDefined());

    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'zzznomatch' },
    });

    expect(screen.getByTestId('forklifts-empty')).toBeDefined();
  });

  it('is case-insensitive', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('forklift-row-fork-1')).toBeDefined());

    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'toyota' },
    });

    expect(screen.queryByTestId('forklift-row-fork-1')).toBeDefined();
    expect(screen.queryByTestId('forklift-row-fork-2')).toBeNull();
  });
});

describe('ForkliftList — category filter', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filters forklifts by category', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('forklift-row-fork-1')).toBeDefined());

    fireEvent.change(screen.getByTestId('category-filter'), {
      target: { value: 'cat-1' },
    });

    expect(screen.queryByTestId('forklift-row-fork-1')).toBeDefined();
    expect(screen.queryByTestId('forklift-row-fork-2')).toBeNull();
  });

  it('shows all forklifts when "all categories" selected', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('forklift-row-fork-1')).toBeDefined());

    fireEvent.change(screen.getByTestId('category-filter'), { target: { value: 'cat-1' } });
    fireEvent.change(screen.getByTestId('category-filter'), { target: { value: '' } });

    expect(screen.queryByTestId('forklift-row-fork-1')).toBeDefined();
    expect(screen.queryByTestId('forklift-row-fork-2')).toBeDefined();
  });
});

describe('ForkliftList — publish toggle', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows toggle publish button for each forklift', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('toggle-publish-fork-1')).toBeDefined());
    expect(screen.getByTestId('toggle-publish-fork-2')).toBeDefined();
  });

  it('optimistically toggles publish status on click', async () => {
    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      callCount++;
      if (table === 'forklifts' && callCount === 1) return buildForkliftChain(SAMPLE_FORKLIFTS);
      if (table === 'categories') return buildCategoryChain(SAMPLE_CATEGORIES);
      // update call
      return buildMutationChain();
    });

    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('forklift-status-fork-1').textContent).toBe('Publicado'));

    fireEvent.click(screen.getByTestId('toggle-publish-fork-1'));

    await waitFor(() => {
      expect(screen.getByTestId('forklift-status-fork-1').textContent).toBe('Borrador');
    });
  });

  it('can publish a draft forklift', async () => {
    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      callCount++;
      if (table === 'forklifts' && callCount === 1) return buildForkliftChain(SAMPLE_FORKLIFTS);
      if (table === 'categories') return buildCategoryChain(SAMPLE_CATEGORIES);
      return buildMutationChain();
    });

    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('forklift-status-fork-2').textContent).toBe('Borrador'));

    fireEvent.click(screen.getByTestId('toggle-publish-fork-2'));

    await waitFor(() => {
      expect(screen.getByTestId('forklift-status-fork-2').textContent).toBe('Publicado');
    });
  });
});

describe('ForkliftList — navigation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('navigates to nueva carretilla on button click', async () => {
    stubInitialFetch([]);
    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('forklifts-list')).toBeDefined());

    fireEvent.click(screen.getByTestId('nueva-carretilla-btn'));
    expect(screen.getByTestId('nueva-page')).toBeDefined();
  });

  it('navigates to edit page on edit button click', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('forklift-row-fork-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('edit-forklift-fork-1'));
    expect(screen.getByTestId('edit-page')).toBeDefined();
  });
});

describe('ForkliftList — delete', () => {
  beforeEach(() => vi.clearAllMocks());

  it('opens delete dialog on delete button click', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('forklift-row-fork-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('delete-forklift-fork-1'));

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeDefined();
    });
  });

  it('shows forklift name in delete dialog', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('forklift-row-fork-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('delete-forklift-fork-1'));

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog').textContent).toContain('Toyota 8FBE15');
    });
  });

  it('deletes forklift on confirm', async () => {
    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      callCount++;
      if (table === 'forklifts') {
        if (callCount === 1) return buildForkliftChain(SAMPLE_FORKLIFTS); // initial fetch
        if (callCount === 3) return buildMutationChain(); // delete
        return buildForkliftChain([SAMPLE_FORKLIFTS[1]]); // refetch
      }
      return buildCategoryChain(SAMPLE_CATEGORIES);
    });

    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('forklift-row-fork-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('delete-forklift-fork-1'));
    await waitFor(() => expect(screen.getByTestId('delete-confirm')).toBeDefined());
    fireEvent.click(screen.getByTestId('delete-confirm'));

    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).toBeNull();
    });
  });

  it('closes dialog on cancel click', async () => {
    stubInitialFetch();
    renderForkliftList();

    await waitFor(() => expect(screen.getByTestId('forklift-row-fork-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('delete-forklift-fork-1'));
    await waitFor(() => expect(screen.getByTestId('delete-cancel')).toBeDefined());
    fireEvent.click(screen.getByTestId('delete-cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).toBeNull();
    });
  });
});

describe('ForkliftList — error state', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows error alert when fetch fails', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: new Error('Network error') }),
    } as AnyReturn);

    renderForkliftList();

    await waitFor(() => {
      expect(screen.getByTestId('forklift-list-error')).toBeDefined();
      expect(screen.getByTestId('forklift-list-error').textContent).toContain('Network error');
    });
  });
});

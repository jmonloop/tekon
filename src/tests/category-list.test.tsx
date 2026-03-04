import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// --- Supabase mock -----------------------------------------------------------
vi.mock('../lib/supabase', () => {
  const mockFrom = vi.fn();
  return { supabase: { from: mockFrom } };
});

import { supabase } from '../lib/supabase';
const mockFrom = vi.mocked(supabase.from);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReturn = any;

const SAMPLE_CATEGORIES = [
  { id: 'cat-1', name: 'Apiladores', slug: 'apiladores', sort_order: 0 },
  { id: 'cat-2', name: 'Transpaletas', slug: 'transpaletas', sort_order: 1 },
];

/** Build a mock that returns a data array from the chain */
function buildDataChain(data: AnyReturn[], error: Error | null = null) {
  const chain: AnyReturn = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error }),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };
  return chain;
}

/** Build a mock for count queries */
function buildCountChain(count: number | null, error: Error | null = null) {
  const chain: AnyReturn = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ count, error }),
  };
  chain.select.mockImplementation((_cols: string, opts: AnyReturn) => {
    if (opts?.head) {
      return { eq: vi.fn().mockResolvedValue({ count, error }) };
    }
    return chain;
  });
  return chain;
}

/** Build a mutation mock (update/insert/delete) that resolves with no error */
function buildMutationChain(error: Error | null = null) {
  const resolved = { data: null, error };
  const chain: AnyReturn = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    eq: vi.fn().mockResolvedValue(resolved),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue(resolved),
    delete: vi.fn().mockReturnThis(),
  };
  chain.update.mockReturnValue({ eq: vi.fn().mockResolvedValue(resolved) });
  chain.delete.mockReturnValue({ eq: vi.fn().mockResolvedValue(resolved) });
  return chain;
}

// --- Imports after mocks -----------------------------------------------------
import { CategoryList } from '../components/admin/CategoryList';

function renderCategoryList() {
  return render(
    <MemoryRouter>
      <CategoryList />
    </MemoryRouter>,
  );
}

// --- Tests -------------------------------------------------------------------

describe('CategoryList — rendering', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the heading', () => {
    mockFrom.mockReturnValue(buildDataChain([]));
    renderCategoryList();
    expect(screen.getByTestId('admin-categorias')).toBeDefined();
    expect(screen.getByText('Categorías')).toBeDefined();
  });

  it('shows loading skeletons while fetching', () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(new Promise(() => {})),
    } as AnyReturn);

    renderCategoryList();
    expect(screen.getByTestId('categories-loading')).toBeDefined();
  });

  it('shows empty state when no categories', async () => {
    mockFrom.mockReturnValue(buildDataChain([]));
    renderCategoryList();

    await waitFor(() => {
      expect(screen.getByTestId('categories-empty')).toBeDefined();
    });
  });

  it('renders category names after load', async () => {
    mockFrom.mockReturnValue(buildDataChain(SAMPLE_CATEGORIES));
    renderCategoryList();

    await waitFor(() => {
      expect(screen.getByTestId('category-name-cat-1').textContent).toBe('Apiladores');
      expect(screen.getByTestId('category-name-cat-2').textContent).toBe('Transpaletas');
    });
  });

  it('shows add-category button', () => {
    mockFrom.mockReturnValue(buildDataChain([]));
    renderCategoryList();
    expect(screen.getByTestId('add-category-btn')).toBeDefined();
  });
});

describe('CategoryList — add new category', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows new category row when clicking add button', async () => {
    mockFrom.mockReturnValue(buildDataChain([]));
    renderCategoryList();

    await waitFor(() => expect(screen.getByTestId('categories-list')).toBeDefined());

    fireEvent.click(screen.getByTestId('add-category-btn'));
    expect(screen.getByTestId('new-category-row')).toBeDefined();
    expect(screen.getByTestId('new-category-name-input')).toBeDefined();
  });

  it('disables add button while adding', async () => {
    mockFrom.mockReturnValue(buildDataChain([]));
    renderCategoryList();

    await waitFor(() => expect(screen.getByTestId('categories-list')).toBeDefined());

    fireEvent.click(screen.getByTestId('add-category-btn'));
    expect((screen.getByTestId('add-category-btn') as HTMLButtonElement).disabled).toBe(true);
  });

  it('cancels adding new category', async () => {
    mockFrom.mockReturnValue(buildDataChain([]));
    renderCategoryList();

    await waitFor(() => expect(screen.getByTestId('categories-list')).toBeDefined());

    fireEvent.click(screen.getByTestId('add-category-btn'));
    fireEvent.click(screen.getByTestId('cancel-new-category'));

    expect(screen.queryByTestId('new-category-row')).toBeNull();
  });

  it('saves new category and refetches', async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return buildDataChain([]); // initial fetch
      if (callCount === 2) return buildMutationChain(); // insert
      return buildDataChain([
        { id: 'cat-new', name: 'Reach Trucks', slug: 'reach-trucks', sort_order: 0 },
      ]); // refetch
    });

    renderCategoryList();
    await waitFor(() => expect(screen.getByTestId('categories-list')).toBeDefined());

    fireEvent.click(screen.getByTestId('add-category-btn'));
    fireEvent.change(screen.getByTestId('new-category-name-input'), {
      target: { value: 'Reach Trucks' },
    });
    fireEvent.click(screen.getByTestId('save-new-category'));

    await waitFor(() => {
      expect(screen.queryByTestId('new-category-row')).toBeNull();
    });
  });

  it('save button disabled when name is empty', async () => {
    mockFrom.mockReturnValue(buildDataChain([]));
    renderCategoryList();

    await waitFor(() => expect(screen.getByTestId('categories-list')).toBeDefined());

    fireEvent.click(screen.getByTestId('add-category-btn'));
    expect((screen.getByTestId('save-new-category') as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('CategoryList — inline edit', () => {
  beforeEach(() => vi.clearAllMocks());

  it('switches to edit mode on Edit click', async () => {
    mockFrom.mockReturnValue(buildDataChain(SAMPLE_CATEGORIES));
    renderCategoryList();

    await waitFor(() => expect(screen.getByTestId('category-name-cat-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('edit-category-cat-1'));
    expect(screen.getByTestId('category-name-input-cat-1')).toBeDefined();
    expect((screen.getByTestId('category-name-input-cat-1') as HTMLInputElement).value).toBe(
      'Apiladores',
    );
  });

  it('exits edit mode on Cancel click', async () => {
    mockFrom.mockReturnValue(buildDataChain(SAMPLE_CATEGORIES));
    renderCategoryList();

    await waitFor(() => expect(screen.getByTestId('category-name-cat-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('edit-category-cat-1'));
    fireEvent.click(screen.getByTestId('cancel-category-cat-1'));

    expect(screen.queryByTestId('category-name-input-cat-1')).toBeNull();
    expect(screen.getByTestId('category-name-cat-1')).toBeDefined();
  });

  it('saves edit and refetches', async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return buildDataChain(SAMPLE_CATEGORIES);
      if (callCount === 2) return buildMutationChain(); // update
      return buildDataChain([
        { id: 'cat-1', name: 'Apiladores Eléctricos', slug: 'apiladores-electricos', sort_order: 0 },
        SAMPLE_CATEGORIES[1],
      ]);
    });

    renderCategoryList();
    await waitFor(() => expect(screen.getByTestId('category-name-cat-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('edit-category-cat-1'));
    const input = screen.getByTestId('category-name-input-cat-1');
    fireEvent.change(input, { target: { value: 'Apiladores Eléctricos' } });
    fireEvent.click(screen.getByTestId('save-category-cat-1'));

    await waitFor(() => {
      expect(screen.queryByTestId('category-name-input-cat-1')).toBeNull();
    });
  });

  it('saves edit via Enter key', async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return buildDataChain(SAMPLE_CATEGORIES);
      if (callCount === 2) return buildMutationChain();
      return buildDataChain(SAMPLE_CATEGORIES);
    });

    renderCategoryList();
    await waitFor(() => expect(screen.getByTestId('category-name-cat-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('edit-category-cat-1'));
    const input = screen.getByTestId('category-name-input-cat-1');
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.queryByTestId('category-name-input-cat-1')).toBeNull();
    });
  });

  it('cancels edit via Escape key', async () => {
    mockFrom.mockReturnValue(buildDataChain(SAMPLE_CATEGORIES));
    renderCategoryList();

    await waitFor(() => expect(screen.getByTestId('category-name-cat-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('edit-category-cat-1'));
    const input = screen.getByTestId('category-name-input-cat-1');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByTestId('category-name-input-cat-1')).toBeNull();
  });
});

describe('CategoryList — delete category', () => {
  beforeEach(() => vi.clearAllMocks());

  it('opens confirmation dialog on Delete click', async () => {
    mockFrom.mockReturnValue(buildDataChain(SAMPLE_CATEGORIES));
    renderCategoryList();

    await waitFor(() => expect(screen.getByTestId('category-name-cat-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('delete-category-cat-1'));
    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeDefined();
    });
  });

  it('shows category name in delete dialog content', async () => {
    mockFrom.mockReturnValue(buildDataChain(SAMPLE_CATEGORIES));
    renderCategoryList();

    await waitFor(() => expect(screen.getByTestId('category-name-cat-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('delete-category-cat-1'));
    await waitFor(() => {
      const dialog = screen.getByTestId('delete-dialog');
      expect(dialog.textContent).toContain('Apiladores');
    });
  });

  it('deletes category when no forklifts exist', async () => {
    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'categories') {
        callCount++;
        if (callCount === 1) return buildDataChain(SAMPLE_CATEGORIES); // initial fetch
        if (callCount === 2) return buildMutationChain(); // delete
        return buildDataChain([SAMPLE_CATEGORIES[1]]); // refetch without cat-1
      }
      // forklifts count check
      return buildCountChain(0);
    });

    renderCategoryList();
    await waitFor(() => expect(screen.getByTestId('category-name-cat-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('delete-category-cat-1'));
    await waitFor(() => expect(screen.getByTestId('delete-confirm')).toBeDefined());
    fireEvent.click(screen.getByTestId('delete-confirm'));

    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).toBeNull();
    });
  });

  it('shows error when category has forklifts', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'categories') return buildDataChain(SAMPLE_CATEGORIES);
      // forklifts count check — 2 forklifts in this category
      return buildCountChain(2);
    });

    renderCategoryList();
    await waitFor(() => expect(screen.getByTestId('category-name-cat-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('delete-category-cat-1'));
    await waitFor(() => expect(screen.getByTestId('delete-confirm')).toBeDefined());
    fireEvent.click(screen.getByTestId('delete-confirm'));

    await waitFor(() => {
      expect(screen.getByTestId('delete-error')).toBeDefined();
      expect(screen.getByTestId('delete-error').textContent).toContain('2 carretilla');
    });
  });

  it('closes dialog on Cancel click', async () => {
    mockFrom.mockReturnValue(buildDataChain(SAMPLE_CATEGORIES));
    renderCategoryList();

    await waitFor(() => expect(screen.getByTestId('category-name-cat-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('delete-category-cat-1'));
    await waitFor(() => expect(screen.getByTestId('delete-cancel')).toBeDefined());
    fireEvent.click(screen.getByTestId('delete-cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).toBeNull();
    });
  });
});

describe('CategoryList — error state', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows error alert when fetch fails', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: new Error('Network error') }),
    } as AnyReturn);

    renderCategoryList();

    await waitFor(() => {
      expect(screen.getByTestId('category-error')).toBeDefined();
      expect(screen.getByTestId('category-error').textContent).toContain('Network error');
    });
  });
});

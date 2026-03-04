import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// --- Supabase mock -----------------------------------------------------------
vi.mock('../lib/supabase', () => {
  const mockFrom = vi.fn();
  const mockStorage = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file.jpg' } }),
    }),
  };
  return { supabase: { from: mockFrom, storage: mockStorage } };
});

import { supabase } from '../lib/supabase';
const mockFrom = vi.mocked(supabase.from);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReturn = any;

// --- Sample data -------------------------------------------------------------

const SAMPLE_CATEGORIES = [
  { id: 'cat-1', name: 'Apiladores', slug: 'apiladores', sort_order: 0 },
  { id: 'cat-2', name: 'Transpaletas', slug: 'transpaletas', sort_order: 1 },
];

const SAMPLE_FORKLIFT = {
  id: 'fork-1',
  name: 'Toyota 8FBE15',
  slug: 'toyota-8fbe15',
  category_id: 'cat-1',
  description: 'Descripción completa del modelo',
  short_description: 'Descripción corta',
  image_url: 'https://example.com/fork1.jpg',
  catalog_pdf_url: 'https://example.com/fork1.pdf',
  available_for_sale: true,
  available_for_rental: false,
  available_as_used: false,
  is_published: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const SAMPLE_SPECS = [
  { id: 'spec-1', forklift_id: 'fork-1', spec_name: 'Capacidad', spec_value: '1000', spec_unit: 'kg', sort_order: 0 },
  { id: 'spec-2', forklift_id: 'fork-1', spec_name: 'Altura', spec_value: '3000', spec_unit: 'mm', sort_order: 1 },
];

// --- Mock builders -----------------------------------------------------------

function buildDataChain(data: AnyReturn, error: AnyReturn = null): AnyReturn {
  return {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error }),
    eq: vi.fn().mockReturnThis(),
  };
}

function buildSingleChain(data: AnyReturn, error: AnyReturn = null): AnyReturn {
  const chain: AnyReturn = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    order: vi.fn().mockReturnThis(),
  };
  // When chained: .select('*').eq('id', id).single()
  chain.eq.mockReturnValue({ single: vi.fn().mockResolvedValue({ data, error }) });
  return chain;
}

function buildInsertChain(data: AnyReturn = { id: 'new-fork-id' }, error: AnyReturn = null): AnyReturn {
  const selectChain: AnyReturn = {
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
  return {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnValue(selectChain),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    delete: vi.fn().mockReturnThis(),
    in: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
}


/**
 * Stub for create mode: categories (call 1), spec_names (call 2)
 */
function stubCreateModeFetch() {
  let callCount = 0;
  mockFrom.mockImplementation((table: string) => {
    callCount++;
    if (table === 'categories') return buildDataChain(SAMPLE_CATEGORIES);
    if (table === 'forklift_specs') {
      if (callCount <= 2) return buildDataChain([]); // spec name suggestions
      return buildDataChain([]); // other spec calls
    }
    return buildDataChain([]);
  });
}

/**
 * Stub for edit mode: categories + spec_names (initial), then forklift + specs (edit fetch)
 */
function stubEditModeFetch() {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'categories') return buildDataChain(SAMPLE_CATEGORIES);
    if (table === 'forklifts') return buildSingleChain(SAMPLE_FORKLIFT);
    if (table === 'forklift_specs') {
      // Could be spec name suggestions or spec list fetch
      return {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: SAMPLE_SPECS, error: null }),
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: SAMPLE_SPECS, error: null }),
          single: vi.fn().mockResolvedValue({ data: SAMPLE_FORKLIFT, error: null }),
        }),
      };
    }
    return buildDataChain([]);
  });
}

// --- Imports after mocks -----------------------------------------------------
import { ForkliftForm } from '../components/admin/ForkliftForm';
import { SpecsEditor } from '../components/admin/SpecsEditor';

function renderCreateForm() {
  return render(
    <MemoryRouter initialEntries={['/carretillas/nueva']} basename="/">
      <Routes>
        <Route path="/carretillas/nueva" element={<ForkliftForm />} />
        <Route path="/carretillas" element={<div data-testid="forklift-list-page" />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEditForm(id = 'fork-1') {
  return render(
    <MemoryRouter initialEntries={[`/carretillas/${id}`]} basename="/">
      <Routes>
        <Route path="/carretillas/:id" element={<ForkliftForm />} />
        <Route path="/carretillas" element={<div data-testid="forklift-list-page" />} />
      </Routes>
    </MemoryRouter>,
  );
}

// --- ForkliftForm tests ------------------------------------------------------

describe('ForkliftForm — create mode rendering', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders "Nueva carretilla" title in create mode', async () => {
    stubCreateModeFetch();
    renderCreateForm();
    await waitFor(() => {
      expect(screen.getByTestId('admin-forklift-form')).toBeDefined();
    });
    expect(screen.getByTestId('forklift-form-title').textContent).toBe('Nueva carretilla');
  });

  it('renders all form fields', async () => {
    stubCreateModeFetch();
    renderCreateForm();
    await waitFor(() => expect(screen.getByTestId('admin-forklift-form')).toBeDefined());

    expect(screen.getByTestId('forklift-name-input')).toBeDefined();
    expect(screen.getByTestId('forklift-slug-input')).toBeDefined();
    expect(screen.getByTestId('forklift-category-select')).toBeDefined();
    expect(screen.getByTestId('forklift-short-description-input')).toBeDefined();
    expect(screen.getByTestId('forklift-description-input')).toBeDefined();
    expect(screen.getByTestId('forklift-sale-checkbox')).toBeDefined();
    expect(screen.getByTestId('forklift-rental-checkbox')).toBeDefined();
    expect(screen.getByTestId('forklift-used-checkbox')).toBeDefined();
    expect(screen.getByTestId('forklift-published-checkbox')).toBeDefined();
    expect(screen.getByTestId('save-forklift-btn')).toBeDefined();
    expect(screen.getByTestId('cancel-forklift-btn')).toBeDefined();
  });

  it('populates category dropdown with fetched categories', async () => {
    stubCreateModeFetch();
    renderCreateForm();
    await waitFor(() => expect(screen.getByTestId('admin-forklift-form')).toBeDefined());

    const select = screen.getByTestId('forklift-category-select') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.text);
    expect(options).toContain('Apiladores');
    expect(options).toContain('Transpaletas');
  });

  it('renders SpecsEditor with empty state', async () => {
    stubCreateModeFetch();
    renderCreateForm();
    await waitFor(() => expect(screen.getByTestId('admin-forklift-form')).toBeDefined());
    expect(screen.getByTestId('specs-editor')).toBeDefined();
    expect(screen.getByTestId('specs-empty')).toBeDefined();
  });
});

describe('ForkliftForm — slug auto-generation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('auto-generates slug from name', async () => {
    stubCreateModeFetch();
    renderCreateForm();
    await waitFor(() => expect(screen.getByTestId('admin-forklift-form')).toBeDefined());

    fireEvent.change(screen.getByTestId('forklift-name-input'), {
      target: { value: 'Toyota 8FBE15' },
    });

    const slugInput = screen.getByTestId('forklift-slug-input') as HTMLInputElement;
    expect(slugInput.value).toBe('toyota-8fbe15');
  });

  it('strips accents in slug generation', async () => {
    stubCreateModeFetch();
    renderCreateForm();
    await waitFor(() => expect(screen.getByTestId('admin-forklift-form')).toBeDefined());

    fireEvent.change(screen.getByTestId('forklift-name-input'), {
      target: { value: 'Apiladores Eléctricos' },
    });

    const slugInput = screen.getByTestId('forklift-slug-input') as HTMLInputElement;
    expect(slugInput.value).toBe('apiladores-electricos');
  });

  it('stops auto-generating slug after manual slug edit', async () => {
    stubCreateModeFetch();
    renderCreateForm();
    await waitFor(() => expect(screen.getByTestId('admin-forklift-form')).toBeDefined());

    // Type name to get auto slug
    fireEvent.change(screen.getByTestId('forklift-name-input'), {
      target: { value: 'Toyota' },
    });

    // Manually edit the slug
    fireEvent.change(screen.getByTestId('forklift-slug-input'), {
      target: { value: 'my-custom-slug' },
    });

    // Change name again
    fireEvent.change(screen.getByTestId('forklift-name-input'), {
      target: { value: 'Toyota Crown' },
    });

    const slugInput = screen.getByTestId('forklift-slug-input') as HTMLInputElement;
    expect(slugInput.value).toBe('my-custom-slug');
  });
});

describe('ForkliftForm — edit mode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading skeleton while fetching in edit mode', () => {
    const neverResolve = new Promise(() => {});
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(neverResolve),
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockReturnValue(neverResolve),
        order: vi.fn().mockReturnValue(neverResolve),
      }),
    } as AnyReturn));

    renderEditForm();
    expect(screen.getByTestId('forklift-form-loading')).toBeDefined();
  });

  it('loads and displays existing forklift data', async () => {
    stubEditModeFetch();
    renderEditForm();

    await waitFor(() => {
      expect(screen.queryByTestId('forklift-form-loading')).toBeNull();
    });

    const nameInput = screen.getByTestId('forklift-name-input') as HTMLInputElement;
    expect(nameInput.value).toBe('Toyota 8FBE15');

    const slugInput = screen.getByTestId('forklift-slug-input') as HTMLInputElement;
    expect(slugInput.value).toBe('toyota-8fbe15');
  });

  it('renders "Editar carretilla" title in edit mode', async () => {
    stubEditModeFetch();
    renderEditForm();

    // Title is present immediately (even during loading)
    expect(screen.getByTestId('forklift-form-title').textContent).toBe('Editar carretilla');
  });

  it('shows existing image preview in edit mode', async () => {
    stubEditModeFetch();
    renderEditForm();

    await waitFor(() => {
      expect(screen.getByTestId('forklift-image-preview')).toBeDefined();
    });

    const img = screen.getByTestId('forklift-image-preview') as HTMLImageElement;
    expect(img.src).toContain('fork1.jpg');
  });

  it('shows PDF filename in edit mode', async () => {
    stubEditModeFetch();
    renderEditForm();

    await waitFor(() => {
      expect(screen.getByTestId('forklift-pdf-name')).toBeDefined();
    });
  });

  it('loads spec rows in edit mode', async () => {
    stubEditModeFetch();
    renderEditForm();

    await waitFor(() => {
      expect(screen.getByTestId('admin-forklift-form')).toBeDefined();
    });

    await waitFor(() => {
      expect(screen.getByTestId('spec-row-spec-1')).toBeDefined();
      expect(screen.getByTestId('spec-row-spec-2')).toBeDefined();
    });
  });

  it('does not auto-generate slug when editing (slug already set)', async () => {
    stubEditModeFetch();
    renderEditForm();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('forklift-form-loading')).toBeNull();
    });

    // Change the name
    fireEvent.change(screen.getByTestId('forklift-name-input'), {
      target: { value: 'New Name' },
    });

    const slugInput = screen.getByTestId('forklift-slug-input') as HTMLInputElement;
    // Slug should NOT have been regenerated
    expect(slugInput.value).toBe('toyota-8fbe15');
  });
});

describe('ForkliftForm — navigation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('navigates to /carretillas on cancel click', async () => {
    stubCreateModeFetch();
    renderCreateForm();
    await waitFor(() => expect(screen.getByTestId('admin-forklift-form')).toBeDefined());

    fireEvent.click(screen.getByTestId('cancel-forklift-btn'));
    expect(screen.getByTestId('forklift-list-page')).toBeDefined();
  });
});

describe('ForkliftForm — validation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows error when name is empty on submit', async () => {
    stubCreateModeFetch();
    renderCreateForm();
    await waitFor(() => expect(screen.getByTestId('admin-forklift-form')).toBeDefined());

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-forklift-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('forklift-form-error')).toBeDefined();
      expect(screen.getByTestId('forklift-form-error').textContent).toContain('nombre');
    });
  });

  it('shows error when category is not selected on submit', async () => {
    stubCreateModeFetch();
    renderCreateForm();
    await waitFor(() => expect(screen.getByTestId('admin-forklift-form')).toBeDefined());

    fireEvent.change(screen.getByTestId('forklift-name-input'), {
      target: { value: 'Test Forklift' },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-forklift-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('forklift-form-error')).toBeDefined();
      expect(screen.getByTestId('forklift-form-error').textContent).toContain('categoría');
    });
  });

  it('dismisses error when close button clicked', async () => {
    stubCreateModeFetch();
    renderCreateForm();
    await waitFor(() => expect(screen.getByTestId('admin-forklift-form')).toBeDefined());

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-forklift-btn'));
    });

    await waitFor(() => expect(screen.getByTestId('forklift-form-error')).toBeDefined());

    fireEvent.click(screen.getByText('Cerrar'));

    expect(screen.queryByTestId('forklift-form-error')).toBeNull();
  });
});

describe('ForkliftForm — create submission', () => {
  beforeEach(() => vi.clearAllMocks());

  it('submits and navigates to /carretillas on success', async () => {
    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      callCount++;
      if (table === 'categories') return buildDataChain(SAMPLE_CATEGORIES);
      if (table === 'forklifts') {
        return buildInsertChain({ id: 'new-fork-id' });
      }
      if (table === 'forklift_specs') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
          delete: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return buildDataChain([]);
    });

    renderCreateForm();
    await waitFor(() => expect(screen.getByTestId('admin-forklift-form')).toBeDefined());

    fireEvent.change(screen.getByTestId('forklift-name-input'), {
      target: { value: 'Nueva Carretilla' },
    });
    fireEvent.change(screen.getByTestId('forklift-category-select'), {
      target: { value: 'cat-1' },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-forklift-btn'));
    });

    await waitFor(() => {
      expect(screen.queryByTestId('forklift-list-page')).toBeDefined();
    });
  });

  it('shows error when Supabase insert fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'categories') return buildDataChain(SAMPLE_CATEGORIES);
      if (table === 'forklifts') {
        const selectChain: AnyReturn = {
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: new Error('Duplicate slug') }),
        };
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          insert: vi.fn().mockReturnValue(selectChain),
        };
      }
      if (table === 'forklift_specs') return buildDataChain([]);
      return buildDataChain([]);
    });

    renderCreateForm();
    await waitFor(() => expect(screen.getByTestId('admin-forklift-form')).toBeDefined());

    fireEvent.change(screen.getByTestId('forklift-name-input'), {
      target: { value: 'Test Forklift' },
    });
    fireEvent.change(screen.getByTestId('forklift-category-select'), {
      target: { value: 'cat-1' },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-forklift-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('forklift-form-error')).toBeDefined();
      expect(screen.getByTestId('forklift-form-error').textContent).toContain('Duplicate slug');
    });
  });
});

describe('ForkliftForm — edit submission', () => {
  beforeEach(() => vi.clearAllMocks());

  it('submits and navigates to /carretillas on successful edit', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'categories') return buildDataChain(SAMPLE_CATEGORIES);
      if (table === 'forklifts') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: SAMPLE_FORKLIFT, error: null }),
            order: vi.fn().mockResolvedValue({ data: SAMPLE_SPECS, error: null }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === 'forklift_specs') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: SAMPLE_SPECS, error: null }),
          }),
          order: vi.fn().mockResolvedValue({ data: SAMPLE_SPECS, error: null }),
          upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
          delete: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return buildDataChain([]);
    });

    renderEditForm();

    await waitFor(() => {
      expect(screen.getByTestId('admin-forklift-form')).toBeDefined();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-forklift-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('forklift-list-page')).toBeDefined();
    });
  });
});

describe('ForkliftForm — checkboxes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('toggles available_for_sale checkbox', async () => {
    stubCreateModeFetch();
    renderCreateForm();
    await waitFor(() => expect(screen.getByTestId('admin-forklift-form')).toBeDefined());

    const checkbox = screen.getByTestId('forklift-sale-checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it('toggles is_published checkbox', async () => {
    stubCreateModeFetch();
    renderCreateForm();
    await waitFor(() => expect(screen.getByTestId('admin-forklift-form')).toBeDefined());

    const checkbox = screen.getByTestId('forklift-published-checkbox') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });
});

// --- SpecsEditor tests -------------------------------------------------------

function renderSpecsEditor(props: {
  specRows?: Parameters<typeof SpecsEditor>[0]['specRows'];
  specNameSuggestions?: string[];
  onChange?: (rows: Parameters<typeof SpecsEditor>[0]['specRows']) => void;
}) {
  const { specRows = [], specNameSuggestions = [], onChange = vi.fn() } = props;
  return render(
    <MemoryRouter>
      <SpecsEditor specRows={specRows} specNameSuggestions={specNameSuggestions} onChange={onChange} />
    </MemoryRouter>,
  );
}

describe('SpecsEditor — rendering', () => {
  it('renders empty state when no rows', () => {
    renderSpecsEditor({});
    expect(screen.getByTestId('specs-editor')).toBeDefined();
    expect(screen.getByTestId('specs-empty')).toBeDefined();
    expect(screen.getByTestId('add-spec-btn')).toBeDefined();
  });

  it('renders spec rows when provided', () => {
    const rows = [
      { id: 'row-1', spec_name: 'Capacidad', spec_value: '1000', spec_unit: 'kg', sort_order: 0 },
      { id: 'row-2', spec_name: 'Altura', spec_value: '3000', spec_unit: 'mm', sort_order: 1 },
    ];
    renderSpecsEditor({ specRows: rows });

    expect(screen.getByTestId('spec-row-row-1')).toBeDefined();
    expect(screen.getByTestId('spec-row-row-2')).toBeDefined();
    expect(screen.queryByTestId('specs-empty')).toBeNull();
  });

  it('shows correct values in row inputs', () => {
    const rows = [
      { id: 'row-1', spec_name: 'Capacidad', spec_value: '1500', spec_unit: 'kg', sort_order: 0 },
    ];
    renderSpecsEditor({ specRows: rows });

    expect((screen.getByTestId('spec-name-row-1') as HTMLInputElement).value).toBe('Capacidad');
    expect((screen.getByTestId('spec-value-row-1') as HTMLInputElement).value).toBe('1500');
    expect((screen.getByTestId('spec-unit-row-1') as HTMLInputElement).value).toBe('kg');
  });

  it('hides deleted rows', () => {
    const rows = [
      { id: 'row-1', spec_name: 'Capacidad', spec_value: '1000', spec_unit: 'kg', sort_order: 0, isDeleted: true },
      { id: 'row-2', spec_name: 'Altura', spec_value: '3000', spec_unit: 'mm', sort_order: 1 },
    ];
    renderSpecsEditor({ specRows: rows });

    expect(screen.queryByTestId('spec-row-row-1')).toBeNull();
    expect(screen.getByTestId('spec-row-row-2')).toBeDefined();
  });
});

describe('SpecsEditor — add row', () => {
  it('calls onChange with a new empty row when add button clicked', () => {
    const onChange = vi.fn();
    renderSpecsEditor({ onChange });

    fireEvent.click(screen.getByTestId('add-spec-btn'));

    expect(onChange).toHaveBeenCalledOnce();
    const newRows = onChange.mock.calls[0][0];
    expect(newRows).toHaveLength(1);
    expect(newRows[0].spec_name).toBe('');
    expect(newRows[0].spec_value).toBe('');
    expect(newRows[0].isNew).toBe(true);
  });

  it('disables add button when 50 rows exist', () => {
    const rows = Array.from({ length: 50 }, (_, i) => ({
      id: `row-${i}`,
      spec_name: 'Spec',
      spec_value: '1',
      spec_unit: '',
      sort_order: i,
    }));
    renderSpecsEditor({ specRows: rows });

    const btn = screen.getByTestId('add-spec-btn') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe('SpecsEditor — delete row', () => {
  it('calls onChange with isDeleted=true when delete button clicked', () => {
    const rows = [
      { id: 'row-1', spec_name: 'Capacidad', spec_value: '1000', spec_unit: 'kg', sort_order: 0 },
    ];
    const onChange = vi.fn();
    renderSpecsEditor({ specRows: rows, onChange });

    fireEvent.click(screen.getByTestId('spec-delete-row-1'));

    expect(onChange).toHaveBeenCalledOnce();
    const updatedRows = onChange.mock.calls[0][0];
    expect(updatedRows[0].isDeleted).toBe(true);
  });

  it('shows empty state after all rows deleted', () => {
    // Simulate parent passing updated rows (with isDeleted=true)
    const rows = [
      { id: 'row-1', spec_name: 'Capacidad', spec_value: '1000', spec_unit: 'kg', sort_order: 0, isDeleted: true },
    ];
    renderSpecsEditor({ specRows: rows });

    expect(screen.getByTestId('specs-empty')).toBeDefined();
  });
});

describe('SpecsEditor — update row', () => {
  it('calls onChange with updated spec_name', () => {
    const rows = [
      { id: 'row-1', spec_name: 'Old Name', spec_value: '1000', spec_unit: 'kg', sort_order: 0 },
    ];
    const onChange = vi.fn();
    renderSpecsEditor({ specRows: rows, onChange });

    fireEvent.change(screen.getByTestId('spec-name-row-1'), {
      target: { value: 'New Name' },
    });

    expect(onChange).toHaveBeenCalledOnce();
    const updatedRows = onChange.mock.calls[0][0];
    expect(updatedRows[0].spec_name).toBe('New Name');
  });

  it('calls onChange with updated spec_value', () => {
    const rows = [
      { id: 'row-1', spec_name: 'Capacidad', spec_value: '1000', spec_unit: 'kg', sort_order: 0 },
    ];
    const onChange = vi.fn();
    renderSpecsEditor({ specRows: rows, onChange });

    fireEvent.change(screen.getByTestId('spec-value-row-1'), {
      target: { value: '2000' },
    });

    expect(onChange).toHaveBeenCalledOnce();
    const updatedRows = onChange.mock.calls[0][0];
    expect(updatedRows[0].spec_value).toBe('2000');
  });

  it('calls onChange with updated spec_unit', () => {
    const rows = [
      { id: 'row-1', spec_name: 'Capacidad', spec_value: '1000', spec_unit: 'kg', sort_order: 0 },
    ];
    const onChange = vi.fn();
    renderSpecsEditor({ specRows: rows, onChange });

    fireEvent.change(screen.getByTestId('spec-unit-row-1'), {
      target: { value: 'lbs' },
    });

    expect(onChange).toHaveBeenCalledOnce();
    const updatedRows = onChange.mock.calls[0][0];
    expect(updatedRows[0].spec_unit).toBe('lbs');
  });
});

describe('SpecsEditor — spec name suggestions', () => {
  it('renders datalist with suggestions', () => {
    renderSpecsEditor({ specNameSuggestions: ['Capacidad', 'Altura', 'Tipo'] });

    const datalist = document.getElementById('spec-name-suggestions');
    expect(datalist).toBeDefined();
    const options = datalist?.querySelectorAll('option');
    expect(options?.length).toBe(3);
  });
});

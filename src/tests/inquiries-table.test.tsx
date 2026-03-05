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

const SAMPLE_INQUIRIES = [
  {
    id: 'inq-1',
    name: 'Juan García',
    email: 'juan@example.com',
    message: 'Estoy interesado en el modelo S100. ¿Podría enviarme más información?',
    forklift_id: 'fork-1',
    read: false,
    created_at: '2026-03-04T10:00:00Z',
    forklift: { id: 'fork-1', name: 'Toyota 8FBE15', slug: 'toyota-8fbe15' },
  },
  {
    id: 'inq-2',
    name: 'María López',
    email: 'maria@example.com',
    message: 'Consulta general sobre alquiler de carretillas.',
    forklift_id: null,
    read: true,
    created_at: '2026-03-03T09:00:00Z',
    forklift: null,
  },
  {
    id: 'inq-3',
    name: 'Carlos Ruiz',
    email: 'carlos@example.com',
    message: 'Necesito información sobre mantenimiento.',
    forklift_id: null,
    read: false,
    created_at: '2026-03-02T08:00:00Z',
    forklift: null,
  },
];

// --- Mock builders -----------------------------------------------------------

function buildInquiryChain(data: AnyReturn[], error: AnyReturn = null): AnyReturn {
  return {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error }),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };
}

function buildMutationChain(error: AnyReturn = null): AnyReturn {
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

function stubInitialFetch(data = SAMPLE_INQUIRIES) {
  mockFrom.mockReturnValue(buildInquiryChain(data));
}

// --- Import after mocks ------------------------------------------------------
import { InquiriesTable } from '../components/admin/InquiriesTable';

function renderInquiriesTable(initialPath = '/consultas') {
  return render(
    <MemoryRouter initialEntries={[initialPath]} basename="/">
      <Routes>
        <Route path="/consultas" element={<InquiriesTable />} />
        <Route path="/carretillas/:id" element={<div data-testid="forklift-edit-page" />} />
      </Routes>
    </MemoryRouter>,
  );
}

// --- Tests -------------------------------------------------------------------

describe('InquiriesTable — rendering', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders heading', () => {
    stubInitialFetch([]);
    renderInquiriesTable();
    expect(screen.getByTestId('admin-consultas')).toBeDefined();
    expect(screen.getByText('Consultas')).toBeDefined();
  });

  it('shows loading skeletons while fetching', () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(new Promise(() => {})),
    } as AnyReturn);

    renderInquiriesTable();
    expect(screen.getByTestId('inquiries-loading')).toBeDefined();
  });

  it('shows empty state when no inquiries', async () => {
    stubInitialFetch([]);
    renderInquiriesTable();

    await waitFor(() => {
      expect(screen.getByTestId('inquiries-empty')).toBeDefined();
    });
  });

  it('renders inquiry rows after load', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => {
      expect(screen.getByTestId('inquiry-row-inq-1')).toBeDefined();
      expect(screen.getByTestId('inquiry-row-inq-2')).toBeDefined();
      expect(screen.getByTestId('inquiry-row-inq-3')).toBeDefined();
    });
  });

  it('displays inquiry name and email', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => {
      expect(screen.getByTestId('inquiry-name-inq-1').textContent).toBe('Juan García');
      expect(screen.getByTestId('inquiry-email-inq-1').textContent).toBe('juan@example.com');
    });
  });

  it('shows forklift link when inquiry has associated forklift', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => {
      expect(screen.getByTestId('inquiry-forklift-link-inq-1')).toBeDefined();
      expect(screen.getByTestId('inquiry-forklift-link-inq-1').textContent).toBe('Toyota 8FBE15');
    });
  });

  it('shows dash when inquiry has no associated forklift', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => {
      expect(screen.getByTestId('inquiry-no-forklift-inq-2')).toBeDefined();
    });
  });

  it('shows "Nueva" badge for unread inquiries', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => {
      expect(screen.getByTestId('unread-badge-inq-1')).toBeDefined();
    });
  });

  it('does not show "Nueva" badge for read inquiries', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => {
      expect(screen.queryByTestId('unread-badge-inq-2')).toBeNull();
    });
  });

  it('displays date for each inquiry', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => {
      expect(screen.getByTestId('inquiry-date-inq-1')).toBeDefined();
    });
  });
});

describe('InquiriesTable — filter tabs', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all three filter tabs', () => {
    stubInitialFetch([]);
    renderInquiriesTable();

    expect(screen.getByTestId('tab-all')).toBeDefined();
    expect(screen.getByTestId('tab-unread')).toBeDefined();
    expect(screen.getByTestId('tab-read')).toBeDefined();
  });

  it('shows unread count badge in unread tab', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => {
      expect(screen.getByTestId('unread-count-badge')).toBeDefined();
      expect(screen.getByTestId('unread-count-badge').textContent).toBe('2');
    });
  });

  it('filters to show only unread when "Sin leer" tab clicked', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => expect(screen.getByTestId('inquiry-row-inq-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('tab-unread'));

    expect(screen.queryByTestId('inquiry-row-inq-1')).toBeDefined();
    expect(screen.queryByTestId('inquiry-row-inq-2')).toBeNull();
    expect(screen.queryByTestId('inquiry-row-inq-3')).toBeDefined();
  });

  it('filters to show only read when "Leídas" tab clicked', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => expect(screen.getByTestId('inquiry-row-inq-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('tab-read'));

    expect(screen.queryByTestId('inquiry-row-inq-1')).toBeNull();
    expect(screen.queryByTestId('inquiry-row-inq-2')).toBeDefined();
    expect(screen.queryByTestId('inquiry-row-inq-3')).toBeNull();
  });

  it('shows all inquiries when "Todas" tab clicked after filtering', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => expect(screen.getByTestId('inquiry-row-inq-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('tab-unread'));
    fireEvent.click(screen.getByTestId('tab-all'));

    expect(screen.queryByTestId('inquiry-row-inq-1')).toBeDefined();
    expect(screen.queryByTestId('inquiry-row-inq-2')).toBeDefined();
  });

  it('shows empty state when tab has no matching inquiries', async () => {
    stubInitialFetch([{ ...SAMPLE_INQUIRIES[0], read: false }]);
    renderInquiriesTable();

    await waitFor(() => expect(screen.getByTestId('inquiry-row-inq-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('tab-read'));

    expect(screen.getByTestId('inquiries-empty')).toBeDefined();
  });
});

describe('InquiriesTable — expand message', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not show message content initially', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => expect(screen.getByTestId('inquiry-row-inq-1')).toBeDefined());

    expect(screen.queryByTestId('inquiry-message-inq-1')).toBeNull();
  });

  it('shows message content when expand button clicked', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => expect(screen.getByTestId('expand-btn-inq-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('expand-btn-inq-1'));

    expect(screen.getByTestId('inquiry-message-inq-1')).toBeDefined();
    expect(screen.getByTestId('inquiry-message-inq-1').textContent).toContain(
      'Estoy interesado en el modelo S100',
    );
  });

  it('collapses message on second click', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => expect(screen.getByTestId('expand-btn-inq-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('expand-btn-inq-1'));
    expect(screen.queryByTestId('inquiry-message-inq-1')).toBeDefined();

    fireEvent.click(screen.getByTestId('expand-btn-inq-1'));
    expect(screen.queryByTestId('inquiry-message-inq-1')).toBeNull();
  });

  it('shows only one expanded message at a time', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => expect(screen.getByTestId('expand-btn-inq-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('expand-btn-inq-1'));
    expect(screen.queryByTestId('inquiry-message-inq-1')).toBeDefined();

    fireEvent.click(screen.getByTestId('expand-btn-inq-2'));
    expect(screen.queryByTestId('inquiry-message-inq-1')).toBeNull();
    expect(screen.queryByTestId('inquiry-message-inq-2')).toBeDefined();
  });
});

describe('InquiriesTable — read/unread toggle', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows toggle read button for each inquiry', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => {
      expect(screen.getByTestId('toggle-read-inq-1')).toBeDefined();
      expect(screen.getByTestId('toggle-read-inq-2')).toBeDefined();
    });
  });

  it('optimistically marks unread inquiry as read on toggle', async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return buildInquiryChain(SAMPLE_INQUIRIES);
      return buildMutationChain();
    });

    renderInquiriesTable();

    await waitFor(() => expect(screen.getByTestId('unread-badge-inq-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('toggle-read-inq-1'));

    await waitFor(() => {
      expect(screen.queryByTestId('unread-badge-inq-1')).toBeNull();
    });
  });

  it('optimistically marks read inquiry as unread on toggle', async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return buildInquiryChain(SAMPLE_INQUIRIES);
      return buildMutationChain();
    });

    renderInquiriesTable();

    await waitFor(() => expect(screen.queryByTestId('unread-badge-inq-2')).toBeNull());

    fireEvent.click(screen.getByTestId('toggle-read-inq-2'));

    await waitFor(() => {
      expect(screen.getByTestId('unread-badge-inq-2')).toBeDefined();
    });
  });
});

describe('InquiriesTable — delete', () => {
  beforeEach(() => vi.clearAllMocks());

  it('opens delete dialog on delete button click', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => expect(screen.getByTestId('delete-inquiry-inq-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('delete-inquiry-inq-1'));

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeDefined();
    });
  });

  it('shows inquiry sender name in delete dialog', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => expect(screen.getByTestId('delete-inquiry-inq-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('delete-inquiry-inq-1'));

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog').textContent).toContain('Juan García');
    });
  });

  it('closes dialog on cancel click', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => expect(screen.getByTestId('delete-inquiry-inq-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('delete-inquiry-inq-1'));
    await waitFor(() => expect(screen.getByTestId('delete-cancel')).toBeDefined());
    fireEvent.click(screen.getByTestId('delete-cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).toBeNull();
    });
  });

  it('deletes inquiry on confirm', async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return buildInquiryChain(SAMPLE_INQUIRIES);
      if (callCount === 2) return buildMutationChain();
      return buildInquiryChain([SAMPLE_INQUIRIES[1], SAMPLE_INQUIRIES[2]]);
    });

    renderInquiriesTable();

    await waitFor(() => expect(screen.getByTestId('inquiry-row-inq-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('delete-inquiry-inq-1'));
    await waitFor(() => expect(screen.getByTestId('delete-confirm')).toBeDefined());
    fireEvent.click(screen.getByTestId('delete-confirm'));

    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).toBeNull();
    });
  });
});

describe('InquiriesTable — error state', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows error alert when fetch fails', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: new Error('Network error') }),
    } as AnyReturn);

    renderInquiriesTable();

    await waitFor(() => {
      expect(screen.getByTestId('inquiries-error')).toBeDefined();
      expect(screen.getByTestId('inquiries-error').textContent).toContain('Network error');
    });
  });
});

describe('InquiriesTable — forklift navigation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('forklift link navigates to forklift edit page', async () => {
    stubInitialFetch();
    renderInquiriesTable();

    await waitFor(() => expect(screen.getByTestId('inquiry-forklift-link-inq-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('inquiry-forklift-link-inq-1'));

    expect(screen.getByTestId('forklift-edit-page')).toBeDefined();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// --- Supabase mock -----------------------------------------------------------
vi.mock('../lib/supabase', () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom,
    },
  };
});

import { supabase } from '../lib/supabase';
const mockFrom = vi.mocked(supabase.from);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReturn = any;

/** Build a mock Supabase query chain that returns { count, error } */
function buildCountChain(count: number | null, error: Error | null = null) {
  const chain: AnyReturn = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
  };
  // The last call in the chain must resolve
  chain.eq.mockResolvedValue({ count, error });
  chain.select.mockImplementation((_cols: string, opts: AnyReturn) => {
    if (opts?.head) {
      // head:true call — return a promise directly from .eq or .select itself
      const headChain: AnyReturn = {
        eq: vi.fn().mockResolvedValue({ count, error }),
      };
      // make headChain itself a promise (for when no .eq follows)
      headChain.then = (resolve: AnyReturn) => resolve({ count, error });
      return headChain;
    }
    return chain;
  });
  return chain;
}

// --- Imports after mocks -----------------------------------------------------
import { Dashboard } from '../components/admin/Dashboard';

function renderDashboard(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]} basename="/">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/carretillas" element={<div data-testid="carretillas-page" />} />
        <Route path="/carretillas/nueva" element={<div data-testid="nueva-carretilla-page" />} />
        <Route path="/consultas" element={<div data-testid="consultas-page" />} />
      </Routes>
    </MemoryRouter>
  );
}

// --- Helpers -----------------------------------------------------------------

/** Stub all 3 supabase.from() calls for the dashboard stats */
function stubDashboardCounts(
  total: number,
  published: number,
  unread: number
) {
  let callCount = 0;
  mockFrom.mockImplementation(() => {
    callCount++;
    // call 1: total forklifts
    // call 2: published forklifts
    // call 3: unread inquiries
    const count =
      callCount === 1 ? total : callCount === 2 ? published : unread;
    return buildCountChain(count);
  });
}

// --- Tests -------------------------------------------------------------------

describe('Dashboard — rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard section with heading', () => {
    stubDashboardCounts(0, 0, 0);
    renderDashboard();
    expect(screen.getByTestId('admin-dashboard')).toBeDefined();
    expect(screen.getByText('Dashboard')).toBeDefined();
  });

  it('shows skeleton placeholders while loading', () => {
    // Make the promise never resolve so we stay in loading state
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnValue(new Promise(() => {})),
      then: undefined,
    } as AnyReturn);

    renderDashboard();
    const skeletons = screen.getAllByTestId('stat-skeleton');
    expect(skeletons.length).toBe(3);
  });

  it('renders 3 stat cards with correct values after load', async () => {
    stubDashboardCounts(10, 7, 3);
    renderDashboard();

    await waitFor(() => {
      expect(screen.queryAllByTestId('stat-skeleton')).toHaveLength(0);
    });

    expect(screen.getByTestId('stat-total-forklifts-value').textContent).toBe('10');
    expect(screen.getByTestId('stat-published-forklifts-value').textContent).toBe('7');
    expect(screen.getByTestId('stat-unread-inquiries-value').textContent).toBe('3');
  });

  it('shows quick action buttons', async () => {
    stubDashboardCounts(0, 0, 0);
    renderDashboard();

    await waitFor(() => {
      expect(screen.queryAllByTestId('stat-skeleton')).toHaveLength(0);
    });

    expect(screen.getByTestId('quick-link-nueva-carretilla')).toBeDefined();
    expect(screen.getByTestId('quick-link-consultas')).toBeDefined();
  });
});

describe('Dashboard — navigation on card click', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubDashboardCounts(5, 3, 2);
  });

  it('navigates to /carretillas when total forklifts card is clicked', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.queryAllByTestId('stat-skeleton')).toHaveLength(0);
    });

    fireEvent.click(screen.getByTestId('stat-total-forklifts'));
    expect(screen.getByTestId('carretillas-page')).toBeDefined();
  });

  it('navigates to /carretillas when published forklifts card is clicked', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.queryAllByTestId('stat-skeleton')).toHaveLength(0);
    });

    fireEvent.click(screen.getByTestId('stat-published-forklifts'));
    expect(screen.getByTestId('carretillas-page')).toBeDefined();
  });

  it('navigates to /consultas when unread inquiries card is clicked', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.queryAllByTestId('stat-skeleton')).toHaveLength(0);
    });

    fireEvent.click(screen.getByTestId('stat-unread-inquiries'));
    expect(screen.getByTestId('consultas-page')).toBeDefined();
  });

  it('navigates to /carretillas/nueva when quick-link button is clicked', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.queryAllByTestId('stat-skeleton')).toHaveLength(0);
    });

    fireEvent.click(screen.getByTestId('quick-link-nueva-carretilla'));
    expect(screen.getByTestId('nueva-carretilla-page')).toBeDefined();
  });

  it('navigates to /consultas when quick-link consultas button is clicked', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.queryAllByTestId('stat-skeleton')).toHaveLength(0);
    });

    fireEvent.click(screen.getByTestId('quick-link-consultas'));
    expect(screen.getByTestId('consultas-page')).toBeDefined();
  });
});

describe('Dashboard — error state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error message when supabase query fails', async () => {
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: null, error: new Error('DB connection failed') }),
      then: (resolve: AnyReturn) => resolve({ count: null, error: new Error('DB connection failed') }),
    } as AnyReturn));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-error')).toBeDefined();
    });
    expect(screen.getByTestId('dashboard-error').textContent).toContain('DB connection failed');
  });
});

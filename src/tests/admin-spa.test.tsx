import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Session, User } from '@supabase/supabase-js';

// --- Supabase mock -----------------------------------------------------------
const neverResolve = new Promise(() => {});
const noopChain = {
  select: () => noopChain,
  order: () => neverResolve,
  eq: () => neverResolve,
  update: () => noopChain,
  delete: () => noopChain,
  insert: () => neverResolve,
};

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
    // Provide a from() that never resolves so child views stay in loading state
    // without throwing. Individual view tests have their own mocks.
    from: vi.fn(() => noopChain),
  },
}));

import { supabase } from '../lib/supabase';
const mockGetSession = vi.mocked(supabase.auth.getSession);
const mockOnAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReturn = any;

function makeSession(email = 'admin@test.com'): Session {
  return {
    access_token: 'token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'refresh',
    user: { id: 'user-1', email, aud: 'authenticated' } as User,
  } as Session;
}

function stubSession(session: Session | null) {
  mockGetSession.mockResolvedValue({ data: { session }, error: null } as AnyReturn);
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  } as AnyReturn);
}

// --- Imports after mocks -----------------------------------------------------
import { AdminShell, AdminRoutes } from '../components/admin/AdminApp';
import { AuthProvider } from '../components/admin/AuthProvider';

/** Renders AdminShell inside a MemoryRouter + AuthProvider with a valid session */
async function renderShellAt(path: string) {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={[path]} basename="/">
        <AuthProvider>
          <AdminShell />
        </AuthProvider>
      </MemoryRouter>
    );
  });
}

// --- Route rendering ---------------------------------------------------------
describe('AdminRoutes — correct view per path', () => {
  it('renders dashboard at /', () => {
    render(
      <MemoryRouter initialEntries={['/']} basename="/">
        <AdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('admin-dashboard')).toBeDefined();
  });

  it('renders forklift list at /carretillas', () => {
    render(
      <MemoryRouter initialEntries={['/carretillas']} basename="/">
        <AdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('admin-carretillas')).toBeDefined();
  });

  it('renders forklift form (create) at /carretillas/nueva', () => {
    render(
      <MemoryRouter initialEntries={['/carretillas/nueva']} basename="/">
        <AdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('admin-forklift-form')).toBeDefined();
    expect(screen.getByText('Nueva carretilla')).toBeDefined();
  });

  it('renders forklift form (edit) at /carretillas/:id', () => {
    render(
      <MemoryRouter initialEntries={['/carretillas/abc-123']} basename="/">
        <AdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('admin-forklift-form')).toBeDefined();
    expect(screen.getByText('Editar carretilla')).toBeDefined();
  });

  it('renders categories at /categorias', () => {
    render(
      <MemoryRouter initialEntries={['/categorias']} basename="/">
        <AdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('admin-categorias')).toBeDefined();
  });

  it('renders inquiries at /consultas', () => {
    render(
      <MemoryRouter initialEntries={['/consultas']} basename="/">
        <AdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('admin-consultas')).toBeDefined();
  });
});

// --- Exclusivity (only correct view rendered) --------------------------------
describe('AdminRoutes — only the matching view is shown', () => {
  it('does not render dashboard when at /carretillas', () => {
    render(
      <MemoryRouter initialEntries={['/carretillas']} basename="/">
        <AdminRoutes />
      </MemoryRouter>
    );
    expect(screen.queryByTestId('admin-dashboard')).toBeNull();
    expect(screen.getByTestId('admin-carretillas')).toBeDefined();
  });

  it('does not render forklift list when at /categorias', () => {
    render(
      <MemoryRouter initialEntries={['/categorias']} basename="/">
        <AdminRoutes />
      </MemoryRouter>
    );
    expect(screen.queryByTestId('admin-carretillas')).toBeNull();
    expect(screen.getByTestId('admin-categorias')).toBeDefined();
  });
});

// --- History navigation (back/forward simulation) ----------------------------
describe('AdminRoutes — history navigation', () => {
  it('renders dashboard at history index 0', () => {
    render(
      <MemoryRouter initialEntries={['/', '/carretillas']} initialIndex={0} basename="/">
        <AdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('admin-dashboard')).toBeDefined();
  });

  it('renders forklift list at history index 1', () => {
    render(
      <MemoryRouter initialEntries={['/', '/carretillas']} initialIndex={1} basename="/">
        <AdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('admin-carretillas')).toBeDefined();
  });

  it('renders categorias at history index 2', () => {
    render(
      <MemoryRouter
        initialEntries={['/', '/carretillas', '/categorias']}
        initialIndex={2}
        basename="/"
      >
        <AdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('admin-categorias')).toBeDefined();
  });
});

// --- Sidebar rendering -------------------------------------------------------
describe('AdminShell — sidebar renders and highlights active route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubSession(makeSession());
  });

  it('renders sidebar alongside main content', async () => {
    await renderShellAt('/');
    expect(screen.getByTestId('admin-sidebar')).toBeDefined();
    expect(screen.getByTestId('admin-dashboard')).toBeDefined();
  });

  it('sidebar has nav links for all four views', async () => {
    await renderShellAt('/');
    expect(screen.getByTestId('sidebar-link-dashboard')).toBeDefined();
    expect(screen.getByTestId('sidebar-link-carretillas')).toBeDefined();
    expect(screen.getByTestId('sidebar-link-categorías')).toBeDefined();
    expect(screen.getByTestId('sidebar-link-consultas')).toBeDefined();
  });

  it('marks Dashboard link as active at /', async () => {
    await renderShellAt('/');
    const link = screen.getByTestId('sidebar-link-dashboard');
    expect(link.getAttribute('aria-current')).toBe('page');
  });

  it('marks Carretillas link as active at /carretillas', async () => {
    await renderShellAt('/carretillas');
    const link = screen.getByTestId('sidebar-link-carretillas');
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(screen.getByTestId('sidebar-link-dashboard').getAttribute('aria-current')).toBeNull();
  });

  it('marks Categorías link as active at /categorias', async () => {
    await renderShellAt('/categorias');
    const link = screen.getByTestId('sidebar-link-categorías');
    expect(link.getAttribute('aria-current')).toBe('page');
  });

  it('marks Consultas link as active at /consultas', async () => {
    await renderShellAt('/consultas');
    const link = screen.getByTestId('sidebar-link-consultas');
    expect(link.getAttribute('aria-current')).toBe('page');
  });

  it('marks Carretillas active for sub-routes like /carretillas/nueva', async () => {
    await renderShellAt('/carretillas/nueva');
    const link = screen.getByTestId('sidebar-link-carretillas');
    expect(link.getAttribute('aria-current')).toBe('page');
  });

  it('renders sign-out button', async () => {
    await renderShellAt('/');
    expect(screen.getByTestId('sidebar-signout')).toBeDefined();
  });
});

// --- Sidebar sign-out --------------------------------------------------------
describe('AdminShell — sign-out', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubSession(makeSession());
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null } as AnyReturn);
    Object.defineProperty(window, 'location', { writable: true, value: { href: '' } });
  });

  it('calls signOut and redirects to /admin/login on sign-out click', async () => {
    await renderShellAt('/');
    await act(async () => {
      fireEvent.click(screen.getByTestId('sidebar-signout'));
    });
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
    expect(window.location.href).toBe('/admin/login');
  });
});

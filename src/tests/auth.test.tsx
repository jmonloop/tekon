import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

// --- Supabase mock (vi.fn() must be inside factory, no external vars) --------
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Import mocked module AFTER vi.mock declaration
import { supabase } from '../lib/supabase';
const mockGetSession = vi.mocked(supabase.auth.getSession);
const mockOnAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange);
const mockSignInWithPassword = vi.mocked(supabase.auth.signInWithPassword);
const mockSignOut = vi.mocked(supabase.auth.signOut);

// Import components after mocks are set up
import { AuthProvider, useAuth } from '../components/admin/AuthProvider';
import { AuthGuard } from '../components/admin/AuthGuard';
import { LoginPage } from '../components/admin/LoginPage';
import { MemoryRouter } from 'react-router-dom';

// --- Helpers -----------------------------------------------------------------
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReturn = any;

function stubSubscription() {
  const unsubscribe = vi.fn();
  mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe } } } as AnyReturn);
  return unsubscribe;
}

function stubGetSession(session: Session | null, error: Error | null = null) {
  mockGetSession.mockResolvedValue({ data: { session }, error } as AnyReturn);
}

function stubSignIn(error: { message: string; status?: number } | null) {
  const user = error ? null : ({ id: 'user-1', email: 'admin@test.com' } as User);
  const session = error ? null : makeSession();
  mockSignInWithPassword.mockResolvedValue({ data: { user, session }, error } as AnyReturn);
}

// --- AuthProvider ------------------------------------------------------------
describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubSubscription();
  });

  it('provides loading=true initially before getSession resolves', () => {
    mockGetSession.mockReturnValue(new Promise(() => {}));

    function Consumer() {
      const { loading } = useAuth();
      return <div data-testid="loading">{String(loading)}</div>;
    }

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading').textContent).toBe('true');
  });

  it('sets loading=false and session after getSession resolves with session', async () => {
    stubGetSession(makeSession());

    function Consumer() {
      const { loading, session } = useAuth();
      return (
        <div>
          <span data-testid="loading">{String(loading)}</span>
          <span data-testid="email">{session?.user.email ?? 'none'}</span>
        </div>
      );
    }

    await act(async () => {
      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('email').textContent).toBe('admin@test.com');
  });

  it('calls signOut and sets session=null when getSession returns error', async () => {
    stubGetSession(null, new Error('expired'));
    mockSignOut.mockResolvedValue({ error: null } as AnyReturn);

    function Consumer() {
      const { session, loading } = useAuth();
      return (
        <div>
          <span data-testid="loading">{String(loading)}</span>
          <span data-testid="session">{session ? 'yes' : 'no'}</span>
        </div>
      );
    }

    await act(async () => {
      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('session').textContent).toBe('no');
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it('updates session when onAuthStateChange fires', async () => {
    stubGetSession(null);

    let authChangeCallback: (event: AuthChangeEvent, session: Session | null) => void = () => {};
    mockOnAuthStateChange.mockImplementation((cb) => {
      authChangeCallback = cb as typeof authChangeCallback;
      return { data: { subscription: { unsubscribe: vi.fn() } } } as AnyReturn;
    });

    function Consumer() {
      const { session } = useAuth();
      return <div data-testid="session">{session?.user.email ?? 'none'}</div>;
    }

    await act(async () => {
      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('session').textContent).toBe('none');

    await act(async () => {
      authChangeCallback('SIGNED_IN', makeSession('new@test.com'));
    });

    expect(screen.getByTestId('session').textContent).toBe('new@test.com');
  });

  it('signOut calls supabase.auth.signOut and redirects to /admin/login', async () => {
    stubGetSession(makeSession());
    mockSignOut.mockResolvedValue({ error: null } as AnyReturn);

    Object.defineProperty(window, 'location', { writable: true, value: { href: '' } });

    function Consumer() {
      const { signOut } = useAuth();
      return <button onClick={signOut}>Sign out</button>;
    }

    await act(async () => {
      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Sign out'));
    });

    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(window.location.href).toBe('/admin/login');
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    function BadConsumer() {
      useAuth();
      return null;
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<BadConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});

// --- AuthGuard ---------------------------------------------------------------
describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubSubscription();
  });

  it('shows loading spinner while session is being checked', () => {
    mockGetSession.mockReturnValue(new Promise(() => {}));

    render(
      <AuthProvider>
        <AuthGuard>
          <div data-testid="protected">Protected content</div>
        </AuthGuard>
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-loading')).toBeDefined();
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('renders children when session is valid', async () => {
    stubGetSession(makeSession());

    await act(async () => {
      render(
        <AuthProvider>
          <AuthGuard>
            <div data-testid="protected">Protected content</div>
          </AuthGuard>
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('protected')).toBeDefined();
    expect(screen.queryByTestId('auth-loading')).toBeNull();
  });

  it('redirects to /admin/login when no session', async () => {
    stubGetSession(null);

    Object.defineProperty(window, 'location', { writable: true, value: { href: '' } });

    await act(async () => {
      render(
        <AuthProvider>
          <AuthGuard>
            <div data-testid="protected">Protected content</div>
          </AuthGuard>
        </AuthProvider>
      );
    });

    expect(window.location.href).toBe('/admin/login');
    expect(screen.queryByTestId('protected')).toBeNull();
  });
});

// --- LoginPage ---------------------------------------------------------------
describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubGetSession(null);
  });

  it('renders email and password inputs', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );
    });

    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Contraseña')).toBeDefined();
  });

  it('renders submit button', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );
    });

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDefined();
  });

  it('calls signInWithPassword with entered credentials on submit', async () => {
    stubSignIn(null);

    Object.defineProperty(window, 'location', { writable: true, value: { href: '' } });

    await act(async () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );
    });

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }).closest('form')!);
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'admin@test.com',
      password: 'password123',
    });
  });

  it('shows error message on invalid credentials', async () => {
    stubSignIn({ message: 'Invalid login credentials', status: 400 });

    await act(async () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );
    });

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'wrongpassword' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }).closest('form')!);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText('Credenciales incorrectas. Inténtalo de nuevo.')).toBeDefined();
    });
  });

  it('shows rate limit error when status is 429', async () => {
    stubSignIn({ message: 'rate limit exceeded', status: 429 });

    await act(async () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }).closest('form')!);
    });

    await waitFor(() => {
      expect(screen.getByText('Demasiados intentos. Espera unos minutos.')).toBeDefined();
    });
  });

  it('redirects to /admin on successful login', async () => {
    stubSignIn(null);

    Object.defineProperty(window, 'location', { writable: true, value: { href: '' } });

    await act(async () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }).closest('form')!);
    });

    await waitFor(() => {
      expect(window.location.href).toBe('/admin');
    });
  });

  it('redirects to /admin if already authenticated on mount', async () => {
    stubGetSession(makeSession());

    Object.defineProperty(window, 'location', { writable: true, value: { href: '' } });

    await act(async () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(window.location.href).toBe('/admin');
    });
  });

  it('disables submit button while loading', async () => {
    mockSignInWithPassword.mockReturnValue(new Promise(() => {}));

    await act(async () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );
    });

    act(() => {
      fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }).closest('form')!);
    });

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: 'Entrando...' });
      expect(btn.hasAttribute('disabled')).toBe(true);
    });
  });
});

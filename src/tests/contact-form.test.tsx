import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';

// --- Supabase mock -----------------------------------------------------------
vi.mock('../lib/supabase', () => {
  const mockFrom = vi.fn();
  return { supabase: { from: mockFrom } };
});

import { supabase } from '../lib/supabase';
const mockFrom = vi.mocked(supabase.from);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReturn = any;

function buildInsertChain(error: AnyReturn = null) {
  return {
    insert: vi.fn().mockResolvedValue({ data: null, error }),
  } as AnyReturn;
}

// --- Import component AFTER mocks -------------------------------------------
import { ContactFormIsland } from '../components/ContactFormIsland';

// --- Helpers -----------------------------------------------------------------

function renderForm(props: { forkliftId?: string; forkliftName?: string } = {}) {
  return render(<ContactFormIsland {...props} />);
}

async function fillAndSubmit(name: string, email: string, message: string) {
  fireEvent.change(screen.getByTestId('contact-name-input'), { target: { value: name } });
  fireEvent.change(screen.getByTestId('contact-email-input'), { target: { value: email } });
  fireEvent.change(screen.getByTestId('contact-message-input'), { target: { value: message } });
  await act(async () => {
    fireEvent.click(screen.getByTestId('contact-submit-btn'));
  });
}

// --- Tests -------------------------------------------------------------------

describe('ContactFormIsland — rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all required fields', () => {
    renderForm();
    expect(screen.getByTestId('contact-form')).toBeDefined();
    expect(screen.getByTestId('contact-name-input')).toBeDefined();
    expect(screen.getByTestId('contact-email-input')).toBeDefined();
    expect(screen.getByTestId('contact-message-input')).toBeDefined();
    expect(screen.getByTestId('contact-submit-btn')).toBeDefined();
  });

  it('shows generic heading when no forklift name provided', () => {
    renderForm();
    expect(screen.getByText('Contacta con nosotros')).toBeDefined();
  });

  it('shows forklift name in heading when provided', () => {
    renderForm({ forkliftId: 'fork-1', forkliftName: 'Toyota 8FBE15' });
    expect(screen.getByText('Consultar sobre Toyota 8FBE15')).toBeDefined();
  });

  it('renders honeypot field', () => {
    renderForm();
    expect(screen.getByTestId('honeypot-field')).toBeDefined();
  });
});

describe('ContactFormIsland — submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls Supabase insert on valid submission', async () => {
    mockFrom.mockReturnValue(buildInsertChain());

    renderForm({ forkliftId: 'fork-1' });
    await fillAndSubmit('Ana García', 'ana@example.com', 'Me interesa este modelo');

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('inquiries');
    });
  });

  it('shows success message after successful submission', async () => {
    mockFrom.mockReturnValue(buildInsertChain());

    renderForm();
    await fillAndSubmit('Ana García', 'ana@example.com', 'Consulta de prueba');

    await waitFor(() => {
      expect(screen.getByTestId('contact-form-success')).toBeDefined();
    });
  });

  it('shows error alert when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(buildInsertChain(new Error('DB error')));

    renderForm();
    await fillAndSubmit('Ana García', 'ana@example.com', 'Consulta de prueba');

    await waitFor(() => {
      expect(screen.getByTestId('contact-form-error')).toBeDefined();
    });
  });

  it('includes forklift_id in payload when provided', async () => {
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
    mockFrom.mockReturnValue({ insert: insertMock } as AnyReturn);

    renderForm({ forkliftId: 'fork-abc' });
    await fillAndSubmit('Juan', 'juan@test.com', 'Mensaje');

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({ forklift_id: 'fork-abc' }),
      );
    });
  });

  it('does not include forklift_id when not provided', async () => {
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
    mockFrom.mockReturnValue({ insert: insertMock } as AnyReturn);

    renderForm();
    await fillAndSubmit('Juan', 'juan@test.com', 'Mensaje');

    await waitFor(() => {
      const callArg = insertMock.mock.calls[0][0] as Record<string, unknown>;
      expect(callArg).not.toHaveProperty('forklift_id');
    });
  });
});

describe('ContactFormIsland — success state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows success alert with role=alert', async () => {
    mockFrom.mockReturnValue(buildInsertChain());

    renderForm();
    await fillAndSubmit('Ana', 'ana@example.com', 'Hola');

    await waitFor(() => {
      const successEl = screen.getByTestId('contact-form-success');
      expect(successEl.getAttribute('role')).toBe('alert');
    });
  });

  it('hides the form after successful submission', async () => {
    mockFrom.mockReturnValue(buildInsertChain());

    renderForm();
    await fillAndSubmit('Ana', 'ana@example.com', 'Hola');

    await waitFor(() => {
      expect(screen.queryByTestId('contact-form')).toBeNull();
    });
  });
});

describe('ContactFormIsland — error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('error alert has role=alert', async () => {
    mockFrom.mockReturnValue(buildInsertChain(new Error('fail')));

    renderForm();
    await fillAndSubmit('Ana', 'ana@example.com', 'Mensaje');

    await waitFor(() => {
      const errorEl = screen.getByTestId('contact-form-error');
      expect(errorEl.getAttribute('role')).toBe('alert');
    });
  });

  it('keeps form visible after error', async () => {
    mockFrom.mockReturnValue(buildInsertChain(new Error('fail')));

    renderForm();
    await fillAndSubmit('Ana', 'ana@example.com', 'Mensaje');

    await waitFor(() => {
      expect(screen.getByTestId('contact-form')).toBeDefined();
    });
  });
});

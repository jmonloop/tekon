import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

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

const SAMPLE_FORKLIFTS = [
  {
    id: 'fork-1',
    name: 'Toyota 8FBE15',
    slug: 'toyota-8fbe15',
    category_id: 'cat-1',
    description: '<p>Descripción</p>',
    short_description: 'Carretilla eléctrica 1.5T',
    image_url: 'https://example.com/fork1.jpg',
    catalog_pdf_url: null,
    available_for_sale: true,
    available_for_rental: false,
    available_as_used: false,
    is_published: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    categories: { id: 'cat-1', name: 'Eléctricas', slug: 'electricas', sort_order: 1, created_at: '2024-01-01' },
  },
  {
    id: 'fork-2',
    name: 'Still RX20',
    slug: 'still-rx20',
    category_id: 'cat-1',
    description: '<p>Descripción 2</p>',
    short_description: 'Carretilla retráctil 1.6T',
    image_url: null,
    catalog_pdf_url: null,
    available_for_sale: true,
    available_for_rental: false,
    available_as_used: false,
    is_published: true,
    created_at: '2024-01-02',
    updated_at: '2024-01-02',
    categories: { id: 'cat-1', name: 'Eléctricas', slug: 'electricas', sort_order: 1, created_at: '2024-01-01' },
  },
];

// --- Mock builder ------------------------------------------------------------

function buildQueryChain(data: AnyReturn, error: AnyReturn = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data, error }),
  } as AnyReturn;
  return chain;
}

// --- Import component AFTER mocks --------------------------------------------

import { FeaturedForkliftsCarousel } from '../components/FeaturedForkliftsCarousel';

// --- Tests -------------------------------------------------------------------

describe('FeaturedForkliftsCarousel — loading state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton while fetching', () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnValue(new Promise(() => {})),
    } as AnyReturn;
    mockFrom.mockReturnValue(chain);

    render(<FeaturedForkliftsCarousel />);
    expect(screen.getByTestId('carousel-loading')).toBeDefined();
  });
});

describe('FeaturedForkliftsCarousel — data display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders featured forklifts after data loads', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    render(<FeaturedForkliftsCarousel />);

    await waitFor(() => {
      expect(screen.getByTestId('featured-carousel')).toBeDefined();
    });
  });

  it('renders all forklifts returned by Supabase', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    render(<FeaturedForkliftsCarousel />);

    await waitFor(() => {
      expect(screen.getByText('Toyota 8FBE15')).toBeDefined();
      expect(screen.getByText('Still RX20')).toBeDefined();
    });
  });

  it('renders ForkliftCard links to detail pages', async () => {
    mockFrom.mockReturnValue(buildQueryChain(SAMPLE_FORKLIFTS));

    render(<FeaturedForkliftsCarousel />);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      const detailLinks = links.filter((l) =>
        (l as HTMLAnchorElement).href.includes('/carretillas/')
      );
      expect(detailLinks.length).toBeGreaterThan(0);
    });
  });

  it('shows empty state when no forklifts returned', async () => {
    mockFrom.mockReturnValue(buildQueryChain([]));

    render(<FeaturedForkliftsCarousel />);

    await waitFor(() => {
      expect(screen.getByTestId('carousel-empty')).toBeDefined();
    });
  });

  it('shows error alert when fetch fails', async () => {
    const errorChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: new Error('Network error') }),
    } as AnyReturn;
    mockFrom.mockReturnValue(errorChain);

    render(<FeaturedForkliftsCarousel />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
    });
  });
});

describe('FeaturedForkliftsCarousel — Supabase query', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries only published forklifts', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: SAMPLE_FORKLIFTS, error: null }),
    } as AnyReturn;
    mockFrom.mockReturnValue(chain);

    render(<FeaturedForkliftsCarousel />);

    await waitFor(() => {
      expect(chain.eq).toHaveBeenCalledWith('is_published', true);
    });
  });

  it('orders by created_at descending', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: SAMPLE_FORKLIFTS, error: null }),
    } as AnyReturn;
    mockFrom.mockReturnValue(chain);

    render(<FeaturedForkliftsCarousel />);

    await waitFor(() => {
      expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });

  it('applies custom limit prop', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: SAMPLE_FORKLIFTS, error: null }),
    } as AnyReturn;
    mockFrom.mockReturnValue(chain);

    render(<FeaturedForkliftsCarousel limit={3} />);

    await waitFor(() => {
      expect(chain.limit).toHaveBeenCalledWith(3);
    });
  });

  it('defaults to limit of 6', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: SAMPLE_FORKLIFTS, error: null }),
    } as AnyReturn;
    mockFrom.mockReturnValue(chain);

    render(<FeaturedForkliftsCarousel />);

    await waitFor(() => {
      expect(chain.limit).toHaveBeenCalledWith(6);
    });
  });
});

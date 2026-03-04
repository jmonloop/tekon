import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryBadge } from '../components/CategoryBadge';
import { ForkliftCard } from '../components/ForkliftCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import type { Forklift } from '../lib/types';

const mockForklift: Forklift = {
  id: 'abc-123',
  name: 'Toyota 8FBN15',
  slug: 'toyota-8fbn15',
  category_id: 'cat-1',
  description: '<p>Full description</p>',
  short_description: 'Carretilla eléctrica 1.5T ideal para interiores.',
  image_url: 'https://example.com/forklift.jpg',
  catalog_pdf_url: null,
  available_for_sale: true,
  available_for_rental: false,
  available_as_used: false,
  is_published: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  category: { id: 'cat-1', name: 'Eléctricas', slug: 'electricas', sort_order: 1, created_at: '2026-01-01T00:00:00Z' },
};

describe('CategoryBadge', () => {
  it('renders the category name', () => {
    render(<CategoryBadge name="Eléctricas" />);
    expect(screen.getByText('Eléctricas')).toBeDefined();
  });

  it('applies custom className', () => {
    const { container } = render(<CategoryBadge name="Térmicas" className="custom-class" />);
    expect((container.firstChild as HTMLElement).className).toContain('custom-class');
  });
});

describe('ForkliftCard', () => {
  it('renders forklift name', () => {
    render(<ForkliftCard forklift={mockForklift} />);
    expect(screen.getByText('Toyota 8FBN15')).toBeDefined();
  });

  it('renders short description', () => {
    render(<ForkliftCard forklift={mockForklift} />);
    expect(screen.getByText('Carretilla eléctrica 1.5T ideal para interiores.')).toBeDefined();
  });

  it('renders category badge when category is present', () => {
    render(<ForkliftCard forklift={mockForklift} />);
    expect(screen.getByText('Eléctricas')).toBeDefined();
  });

  it('renders CTA link to forklift detail page', () => {
    render(<ForkliftCard forklift={mockForklift} />);
    const links = screen.getAllByRole('link');
    const ctaLink = links.find((l) => l.textContent === 'Ver detalles');
    expect(ctaLink).toBeDefined();
    expect((ctaLink as HTMLAnchorElement).href).toContain('/carretillas/toyota-8fbn15');
  });

  it('renders forklift image with alt text', () => {
    render(<ForkliftCard forklift={mockForklift} />);
    const img = screen.getByAltText('Toyota 8FBN15');
    expect(img).toBeDefined();
    expect((img as HTMLImageElement).alt).toBe('Toyota 8FBN15');
  });

  it('uses placeholder image when image_url is null', () => {
    const noImage = { ...mockForklift, image_url: null };
    render(<ForkliftCard forklift={noImage} />);
    const img = screen.getByAltText('Toyota 8FBN15') as HTMLImageElement;
    expect(img.src).toContain('placeholder');
  });

  it('does not render category badge when category is absent', () => {
    const noCategory = { ...mockForklift, category: undefined };
    render(<ForkliftCard forklift={noCategory} />);
    expect(screen.queryByText('Eléctricas')).toBeNull();
  });
});

describe('LoadingSkeleton', () => {
  it('renders default 6 skeleton cards', () => {
    const { container } = render(<LoadingSkeleton />);
    const cards = container.querySelectorAll('.rounded-xl');
    expect(cards.length).toBe(6);
  });

  it('renders the specified count of skeleton cards', () => {
    const { container } = render(<LoadingSkeleton count={3} />);
    const cards = container.querySelectorAll('.rounded-xl');
    expect(cards.length).toBe(3);
  });

  it('has aria-busy and aria-label attributes for accessibility', () => {
    render(<LoadingSkeleton />);
    const container = screen.getByLabelText('Cargando productos...');
    expect(container).toBeDefined();
    expect(container.getAttribute('aria-busy')).toBe('true');
  });
});

describe('ErrorAlert', () => {
  it('renders the error message', () => {
    render(<ErrorAlert message="No se pudieron cargar los productos." />);
    expect(screen.getByText('No se pudieron cargar los productos.')).toBeDefined();
  });

  it('renders the default title when none provided', () => {
    render(<ErrorAlert message="Error de red." />);
    expect(screen.getByText('Ha ocurrido un error')).toBeDefined();
  });

  it('renders a custom title', () => {
    render(<ErrorAlert title="Error de conexión" message="Inténtalo más tarde." />);
    expect(screen.getByText('Error de conexión')).toBeDefined();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorAlert message="Error." onRetry={onRetry} />);
    const btn = screen.getByRole('button', { name: /intentar de nuevo/i });
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('does not render retry button when onRetry is absent', () => {
    render(<ErrorAlert message="Error." />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('has role="alert" for accessibility', () => {
    render(<ErrorAlert message="Error." />);
    expect(screen.getByRole('alert')).toBeDefined();
  });
});

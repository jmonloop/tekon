import { describe, it, expect } from 'vitest';
import { localBusinessJsonLd, productJsonLd } from './seo';

describe('localBusinessJsonLd', () => {
  it('has required Schema.org fields', () => {
    expect(localBusinessJsonLd['@context']).toBe('https://schema.org');
    expect(localBusinessJsonLd['@type']).toBe('LocalBusiness');
    expect(localBusinessJsonLd['@id']).toContain('/#organization');
  });

  it('includes Tekon business name', () => {
    expect(localBusinessJsonLd.name).toBe('Carretillas Tekon');
  });

  it('includes address with Valencia region', () => {
    expect(localBusinessJsonLd.address.addressRegion).toBe('Valencia');
    expect(localBusinessJsonLd.address.addressLocality).toBe('Sueca');
    expect(localBusinessJsonLd.address.addressCountry).toBe('ES');
  });

  it('includes opening hours for weekdays', () => {
    const hours = localBusinessJsonLd.openingHoursSpecification[0];
    expect(hours.dayOfWeek).toContain('Monday');
    expect(hours.dayOfWeek).toContain('Friday');
    expect(hours.opens).toBe('08:00');
    expect(hours.closes).toBe('18:00');
  });
});

describe('productJsonLd', () => {
  const baseForklift = {
    name: 'Toyota 8FBE15',
    slug: 'toyota-8fbe15',
    short_description: 'Carretilla eléctrica contrapesada 1.5T',
    description: '<p>Descripción completa</p>',
    image_url: 'https://example.com/fork1.jpg',
    category: { name: 'Eléctricas' },
    available_for_sale: true,
    available_for_rental: false,
  };

  it('returns a Product schema', () => {
    const result = productJsonLd(baseForklift);
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('Product');
  });

  it('uses forklift name', () => {
    const result = productJsonLd(baseForklift);
    expect(result.name).toBe('Toyota 8FBE15');
  });

  it('uses short_description as description', () => {
    const result = productJsonLd(baseForklift);
    expect(result.description).toBe('Carretilla eléctrica contrapesada 1.5T');
  });

  it('falls back to stripped description when no short_description', () => {
    const forklift = { ...baseForklift, short_description: null };
    const result = productJsonLd(forklift);
    expect(result.description).toBe('Descripción completa');
  });

  it('generates correct URL', () => {
    const result = productJsonLd(baseForklift);
    expect(result.url).toContain('/carretillas/toyota-8fbe15');
  });

  it('sets InStock when available_for_sale is true', () => {
    const result = productJsonLd(baseForklift);
    expect(result.offers.availability).toBe('https://schema.org/InStock');
  });

  it('sets PreOrder when available_for_sale is false', () => {
    const forklift = { ...baseForklift, available_for_sale: false };
    const result = productJsonLd(forklift);
    expect(result.offers.availability).toBe('https://schema.org/PreOrder');
  });

  it('uses category name', () => {
    const result = productJsonLd(baseForklift);
    expect(result.category).toBe('Eléctricas');
  });

  it('handles null category gracefully', () => {
    const forklift = { ...baseForklift, category: null };
    const result = productJsonLd(forklift);
    expect(result.category).toBe('');
  });

  it('links seller to LocalBusiness @id', () => {
    const result = productJsonLd(baseForklift);
    expect(result.offers.seller['@id']).toContain('/#organization');
  });
});

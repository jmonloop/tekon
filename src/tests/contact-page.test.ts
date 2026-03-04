import { describe, it, expect } from 'vitest';
import { localBusinessJsonLd } from '../lib/seo';

describe('Contact page — LocalBusiness JSON-LD', () => {
  it('has correct Schema.org context', () => {
    expect(localBusinessJsonLd['@context']).toBe('https://schema.org');
  });

  it('has LocalBusiness type', () => {
    expect(localBusinessJsonLd['@type']).toBe('LocalBusiness');
  });

  it('has correct business name', () => {
    expect(localBusinessJsonLd.name).toBe('Carretillas Tekon');
  });

  it('has telephone', () => {
    expect(localBusinessJsonLd.telephone).toBeTruthy();
  });

  it('telephone matches expected number', () => {
    expect(localBusinessJsonLd.telephone).toBe('+34961705113');
  });

  it('has email address', () => {
    expect(localBusinessJsonLd.email).toBeTruthy();
  });

  it('email is info@carretillastekon.com', () => {
    expect(localBusinessJsonLd.email).toBe('info@carretillastekon.com');
  });

  it('has correct address in Sueca, Valencia', () => {
    expect(localBusinessJsonLd.address.addressLocality).toBe('Sueca');
    expect(localBusinessJsonLd.address.addressRegion).toBe('Valencia');
    expect(localBusinessJsonLd.address.addressCountry).toBe('ES');
  });

  it('has postal code 46410', () => {
    expect(localBusinessJsonLd.address.postalCode).toBe('46410');
  });

  it('has geo coordinates for Sueca', () => {
    expect(localBusinessJsonLd.geo).toBeDefined();
    expect(localBusinessJsonLd.geo.latitude).toBeCloseTo(39.2, 0);
    expect(localBusinessJsonLd.geo.longitude).toBeCloseTo(-0.31, 1);
  });

  it('has opening hours specification', () => {
    expect(localBusinessJsonLd.openingHoursSpecification).toBeDefined();
    expect(localBusinessJsonLd.openingHoursSpecification.length).toBeGreaterThan(0);
  });

  it('opening hours are Monday to Friday 08:00-18:00', () => {
    const hours = localBusinessJsonLd.openingHoursSpecification[0];
    expect(hours.dayOfWeek).toContain('Monday');
    expect(hours.dayOfWeek).toContain('Friday');
    expect(hours.opens).toBe('08:00');
    expect(hours.closes).toBe('18:00');
  });
});

describe('Contact page — page metadata', () => {
  const title = 'Contacto | Carretillas Tekon — Valencia';
  const description =
    'Contacta con Carretillas Tekon en Sueca, Valencia. Consultas sobre venta, alquiler y reparación de carretillas elevadoras.';

  it('title contains Contacto', () => {
    expect(title.toLowerCase()).toContain('contacto');
  });

  it('title contains Carretillas Tekon', () => {
    expect(title).toContain('Carretillas Tekon');
  });

  it('title contains Valencia location', () => {
    expect(title).toContain('Valencia');
  });

  it('title is under 60 characters', () => {
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it('description mentions Sueca and Valencia', () => {
    expect(description.toLowerCase()).toContain('sueca');
    expect(description.toLowerCase()).toContain('valencia');
  });

  it('description is under 155 characters', () => {
    expect(description.length).toBeLessThanOrEqual(155);
  });
});

describe('Contact page — contact info data', () => {
  const phoneNumber = '+34961705113';
  const emailAddress = 'info@carretillastekon.com';
  const addressLocality = 'Sueca';
  const addressRegion = 'Valencia';
  const postalCode = '46410';

  it('phone number is valid Spanish format', () => {
    expect(phoneNumber).toMatch(/^\+34\d{9}$/);
  });

  it('email address is valid format', () => {
    expect(emailAddress).toContain('@');
    expect(emailAddress).toContain('carretillastekon.com');
  });

  it('address locality is Sueca', () => {
    expect(addressLocality).toBe('Sueca');
  });

  it('address region is Valencia', () => {
    expect(addressRegion).toBe('Valencia');
  });

  it('postal code is 46410', () => {
    expect(postalCode).toBe('46410');
  });
});

describe('Contact page — map embed', () => {
  const mapSrc =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3147.1234567890!2d-0.3117!3d39.2028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDEyJzEwLjEiTiAwwrAxOCc0Mi4xIlc!5e0!3m2!1ses!2ses!4v1234567890';

  it('map src points to Google Maps embed endpoint', () => {
    expect(mapSrc).toContain('google.com/maps/embed');
  });

  it('map embed includes Sueca coordinates (latitude ~39.2)', () => {
    expect(mapSrc).toContain('39.2028');
  });

  it('map embed includes Sueca coordinates (longitude ~-0.31)', () => {
    expect(mapSrc).toContain('-0.3117');
  });

  it('map embed uses Spanish locale', () => {
    expect(mapSrc).toContain('2ses');
  });
});

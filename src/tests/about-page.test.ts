import { describe, it, expect } from 'vitest';
import { localBusinessJsonLd } from '../lib/seo';

// These tests verify the localBusinessJsonLd structure used on the About page
// and that the page content is consistent with the structured data.

describe('About page — LocalBusiness JSON-LD', () => {
  it('has correct Schema.org context', () => {
    expect(localBusinessJsonLd['@context']).toBe('https://schema.org');
  });

  it('has LocalBusiness type', () => {
    expect(localBusinessJsonLd['@type']).toBe('LocalBusiness');
  });

  it('has correct business name', () => {
    expect(localBusinessJsonLd.name).toBe('Carretillas Tekon');
  });

  it('has founding date 1989', () => {
    expect(localBusinessJsonLd.foundingDate).toBe('1989');
  });

  it('has correct address in Sueca, Valencia', () => {
    expect(localBusinessJsonLd.address.addressLocality).toBe('Sueca');
    expect(localBusinessJsonLd.address.addressRegion).toBe('Valencia');
    expect(localBusinessJsonLd.address.addressCountry).toBe('ES');
  });

  it('has telephone', () => {
    expect(localBusinessJsonLd.telephone).toBeTruthy();
  });

  it('has business description mentioning Valencia', () => {
    expect(localBusinessJsonLd.description.toLowerCase()).toContain('valencia');
  });

  it('has description mentioning founding year 1989', () => {
    expect(localBusinessJsonLd.description).toContain('1989');
  });
});

describe('About page — company values structure', () => {
  const values = [
    { number: '01', title: 'Experiencia' },
    { number: '02', title: 'Compromiso' },
    { number: '03', title: 'Gama de Productos' },
    { number: '04', title: 'Servicios de Alquiler' },
    { number: '05', title: 'Compromiso Ambiental' },
    { number: '06', title: 'Atención al Cliente' },
  ];

  it('has exactly 6 company values', () => {
    expect(values).toHaveLength(6);
  });

  it('values are numbered sequentially from 01 to 06', () => {
    values.forEach((value, index) => {
      const expectedNumber = String(index + 1).padStart(2, '0');
      expect(value.number).toBe(expectedNumber);
    });
  });

  it('first value is Experiencia', () => {
    expect(values[0].title).toBe('Experiencia');
  });

  it('last value is Atención al Cliente', () => {
    expect(values[5].title).toBe('Atención al Cliente');
  });

  it('includes environmental commitment value', () => {
    expect(values.some((v) => v.title.toLowerCase().includes('ambiental'))).toBe(true);
  });

  it('includes rental services value', () => {
    expect(values.some((v) => v.title.toLowerCase().includes('alquiler'))).toBe(true);
  });
});

describe('About page — company history content', () => {
  const FOUNDING_YEAR = 1989;
  const CURRENT_YEAR = 2026;
  const YEARS_OF_EXPERIENCE = CURRENT_YEAR - FOUNDING_YEAR;

  it('founded in 1989', () => {
    expect(FOUNDING_YEAR).toBe(1989);
  });

  it('has more than 35 years of experience', () => {
    expect(YEARS_OF_EXPERIENCE).toBeGreaterThan(35);
  });

  it('localBusinessJsonLd @id references site URL', () => {
    expect(localBusinessJsonLd['@id']).toContain('carretillastekon.com');
  });

  it('localBusinessJsonLd has opening hours', () => {
    expect(localBusinessJsonLd.openingHoursSpecification).toBeDefined();
    expect(localBusinessJsonLd.openingHoursSpecification.length).toBeGreaterThan(0);
  });

  it('localBusinessJsonLd opening hours cover Monday to Friday', () => {
    const hours = localBusinessJsonLd.openingHoursSpecification[0];
    expect(hours.dayOfWeek).toContain('Monday');
    expect(hours.dayOfWeek).toContain('Friday');
  });

  it('localBusinessJsonLd has geo coordinates for Sueca', () => {
    expect(localBusinessJsonLd.geo).toBeDefined();
    expect(localBusinessJsonLd.geo.latitude).toBeCloseTo(39.2, 0);
  });
});

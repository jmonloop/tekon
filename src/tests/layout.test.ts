import { describe, it, expect } from 'vitest';
import {
  navLinks,
  legalLinks,
  SITE_NAME,
  DEFAULT_OG_IMAGE_PATH,
  type NavLink,
} from '../layouts/layout-data';

describe('Layout data: navLinks', () => {
  it('contains all required public navigation routes', () => {
    const hrefs = navLinks.map(l => l.href);
    expect(hrefs).toContain('/venta-de-carretillas');
    expect(hrefs).toContain('/alquiler-de-carretillas');
    expect(hrefs).toContain('/carretillas-de-segunda-mano');
    expect(hrefs).toContain('/nuestras-soluciones');
    expect(hrefs).toContain('/sobre-nosotros');
    expect(hrefs).toContain('/contacto');
  });

  it('each nav link has a non-empty label', () => {
    navLinks.forEach((link: NavLink) => {
      expect(link.label.trim().length).toBeGreaterThan(0);
    });
  });

  it('each nav link href starts with /', () => {
    navLinks.forEach((link: NavLink) => {
      expect(link.href.startsWith('/')).toBe(true);
    });
  });

  it('does not include admin routes', () => {
    const hrefs = navLinks.map(l => l.href);
    hrefs.forEach(href => {
      expect(href.startsWith('/admin')).toBe(false);
    });
  });
});

describe('Layout data: legalLinks', () => {
  it('contains all three legal pages', () => {
    const hrefs = legalLinks.map(l => l.href);
    expect(hrefs).toContain('/politica-de-privacidad');
    expect(hrefs).toContain('/politica-de-cookies');
    expect(hrefs).toContain('/aviso-legal');
  });

  it('has exactly 3 legal links', () => {
    expect(legalLinks).toHaveLength(3);
  });

  it('each legal link has a non-empty label', () => {
    legalLinks.forEach((link: NavLink) => {
      expect(link.label.trim().length).toBeGreaterThan(0);
    });
  });
});

describe('Layout data: constants', () => {
  it('SITE_NAME is Carretillas Tekon', () => {
    expect(SITE_NAME).toBe('Carretillas Tekon');
  });

  it('DEFAULT_OG_IMAGE_PATH points to a png image', () => {
    expect(DEFAULT_OG_IMAGE_PATH).toMatch(/\.png$/);
  });
});

describe('Canonical URL construction', () => {
  it('correctly builds canonical URL from pathname and site', () => {
    const site = 'https://www.carretillastekon.com';
    const pathname = '/venta-de-carretillas';
    const canonical = new URL(pathname, site);
    expect(canonical.href).toBe('https://www.carretillastekon.com/venta-de-carretillas');
  });

  it('handles root path', () => {
    const site = 'https://www.carretillastekon.com';
    const canonical = new URL('/', site);
    expect(canonical.href).toBe('https://www.carretillastekon.com/');
  });

  it('handles nested paths', () => {
    const site = 'https://www.carretillastekon.com';
    const canonical = new URL('/carretillas/apilador-s100', site);
    expect(canonical.href).toBe('https://www.carretillastekon.com/carretillas/apilador-s100');
  });
});

describe('OG image fallback', () => {
  it('falls back to default OG image path when ogImage is not provided', () => {
    const site = 'https://www.carretillastekon.com';
    const ogImage: string | undefined = undefined;
    const ogImageUrl = ogImage || new URL(DEFAULT_OG_IMAGE_PATH, site).toString();
    expect(ogImageUrl).toBe(`https://www.carretillastekon.com/${DEFAULT_OG_IMAGE_PATH}`);
  });

  it('uses provided ogImage when specified', () => {
    const site = 'https://www.carretillastekon.com';
    const ogImage = 'https://storage.example.com/forklift.jpg';
    const ogImageUrl = ogImage || new URL(DEFAULT_OG_IMAGE_PATH, site).toString();
    expect(ogImageUrl).toBe('https://storage.example.com/forklift.jpg');
  });
});

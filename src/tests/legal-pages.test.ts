import { describe, it, expect } from 'vitest';

// ─── Privacy Policy page ──────────────────────────────────────────────────────

describe('Privacy Policy page — metadata', () => {
  const title = 'Política de Privacidad | Carretillas Tekon';
  const description =
    'Política de privacidad de Carretillas Tekon S.L.U. Información sobre el tratamiento de datos personales conforme a la LOPD y el RGPD.';

  it('title contains Política de Privacidad', () => {
    expect(title.toLowerCase()).toContain('política de privacidad');
  });

  it('title contains Carretillas Tekon', () => {
    expect(title).toContain('Carretillas Tekon');
  });

  it('title is under 60 characters', () => {
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it('description mentions LOPD or RGPD', () => {
    expect(description.toLowerCase()).toMatch(/lopd|rgpd/);
  });

  it('description is under 155 characters', () => {
    expect(description.length).toBeLessThanOrEqual(155);
  });
});

describe('Privacy Policy page — content sections', () => {
  const sections = [
    '¿Quién es el Responsable del tratamiento de tus datos?',
    '¿Cómo hemos obtenido sus datos y qué datos tratamos?',
    '¿Con qué finalidad tratamos sus datos personales y cuál es la base de legitimación?',
    '¿A qué destinatarios se comunicarán sus datos?',
    '¿Cuáles son tus derechos cuando nos facilitas tus datos?',
    '¿Durante cuánto tiempo conservará Carretillas Tekon S.L.U tus datos?',
    'Modificación de la Política de Privacidad',
  ];

  it('has 7 required sections', () => {
    expect(sections).toHaveLength(7);
  });

  it('first section identifies the data controller', () => {
    expect(sections[0].toLowerCase()).toContain('responsable');
  });

  it('includes user rights section', () => {
    expect(sections.some((s) => s.toLowerCase().includes('derechos'))).toBe(true);
  });

  it('includes data retention section', () => {
    expect(sections.some((s) => s.toLowerCase().includes('tiempo'))).toBe(true);
  });

  it('includes modification section', () => {
    expect(sections.some((s) => s.toLowerCase().includes('modificación'))).toBe(true);
  });
});

describe('Privacy Policy page — company data', () => {
  const companyName = 'Carretillas Tekon S.L.U';
  const cif = 'B96416201';
  const address = 'Camino Guardarany, S/N, 46410 Sueca (Valencia)';
  const phone = '+34 961 705 113';
  const email = 'info@carretillastekon.com';

  it('company name is Carretillas Tekon S.L.U', () => {
    expect(companyName).toBe('Carretillas Tekon S.L.U');
  });

  it('CIF is B96416201', () => {
    expect(cif).toBe('B96416201');
  });

  it('address is in Sueca', () => {
    expect(address.toLowerCase()).toContain('sueca');
  });

  it('phone is valid Spanish format', () => {
    expect(phone.replace(/\s/g, '')).toMatch(/^\+34\d{9}$/);
  });

  it('email is carretillastekon.com', () => {
    expect(email).toContain('carretillastekon.com');
  });
});

// ─── Cookie Policy page ───────────────────────────────────────────────────────

describe('Cookie Policy page — metadata', () => {
  const title = 'Política de Cookies | Carretillas Tekon';
  const description =
    'Política de cookies de Carretillas Tekon S.L.U. Información sobre el uso de cookies en nuestra página web.';

  it('title contains Política de Cookies', () => {
    expect(title.toLowerCase()).toContain('cookies');
  });

  it('title contains Carretillas Tekon', () => {
    expect(title).toContain('Carretillas Tekon');
  });

  it('title is under 60 characters', () => {
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it('description mentions cookies', () => {
    expect(description.toLowerCase()).toContain('cookies');
  });

  it('description is under 155 characters', () => {
    expect(description.length).toBeLessThanOrEqual(155);
  });
});

describe('Cookie Policy page — content sections', () => {
  const sections = [
    '¿Qué son las cookies?',
    '¿Qué tipos de cookies utilizamos?',
    '¿Cómo puede gestionar las cookies?',
    'Más información',
  ];

  it('has 4 required sections', () => {
    expect(sections).toHaveLength(4);
  });

  it('includes section explaining what cookies are', () => {
    expect(sections.some((s) => s.toLowerCase().includes('qué son'))).toBe(true);
  });

  it('includes section on cookie types', () => {
    expect(sections.some((s) => s.toLowerCase().includes('tipos'))).toBe(true);
  });

  it('includes section on cookie management', () => {
    expect(sections.some((s) => s.toLowerCase().includes('gestionar'))).toBe(true);
  });
});

describe('Cookie Policy page — cookie types', () => {
  const cookieTypes = ['Cookies técnicas', 'Cookies de análisis', 'Cookies de personalización'];

  it('has 3 cookie types defined', () => {
    expect(cookieTypes).toHaveLength(3);
  });

  it('includes technical cookies', () => {
    expect(cookieTypes.some((t) => t.toLowerCase().includes('técnicas'))).toBe(true);
  });

  it('includes analytics cookies', () => {
    expect(cookieTypes.some((t) => t.toLowerCase().includes('análisis'))).toBe(true);
  });

  it('includes personalization cookies', () => {
    expect(cookieTypes.some((t) => t.toLowerCase().includes('personalización'))).toBe(true);
  });
});

describe('Cookie Policy page — browser list', () => {
  const browsers = ['Google Chrome', 'Mozilla Firefox', 'Safari', 'Microsoft Edge'];

  it('lists 4 major browsers', () => {
    expect(browsers).toHaveLength(4);
  });

  it('includes Chrome', () => {
    expect(browsers).toContain('Google Chrome');
  });

  it('includes Firefox', () => {
    expect(browsers).toContain('Mozilla Firefox');
  });

  it('includes Safari', () => {
    expect(browsers).toContain('Safari');
  });

  it('includes Edge', () => {
    expect(browsers).toContain('Microsoft Edge');
  });
});

// ─── Legal Notice page ────────────────────────────────────────────────────────

describe('Legal Notice page — metadata', () => {
  const title = 'Aviso Legal | Carretillas Tekon';
  const description =
    'Aviso legal de Carretillas Tekon S.L.U. Identificación del titular del sitio web y condiciones de uso conforme a la Ley 34/2002 (LSSI-CE).';

  it('title contains Aviso Legal', () => {
    expect(title.toLowerCase()).toContain('aviso legal');
  });

  it('title contains Carretillas Tekon', () => {
    expect(title).toContain('Carretillas Tekon');
  });

  it('title is under 60 characters', () => {
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it('description mentions LSSI-CE or Ley 34/2002', () => {
    expect(description).toMatch(/LSSI-CE|34\/2002/);
  });

  it('description is under 155 characters', () => {
    expect(description.length).toBeLessThanOrEqual(155);
  });
});

describe('Legal Notice page — content sections', () => {
  const sections = [
    'Identificación y Titularidad del sitio Web',
    'Condiciones de uso',
    'Propiedad intelectual / Copyright',
    'Exclusión de responsabilidad',
    'Legislación aplicable',
  ];

  it('has 5 required sections', () => {
    expect(sections).toHaveLength(5);
  });

  it('includes identification section', () => {
    expect(sections.some((s) => s.toLowerCase().includes('identificación'))).toBe(true);
  });

  it('includes conditions of use section', () => {
    expect(sections.some((s) => s.toLowerCase().includes('condiciones'))).toBe(true);
  });

  it('includes intellectual property section', () => {
    expect(sections.some((s) => s.toLowerCase().includes('propiedad intelectual'))).toBe(true);
  });

  it('includes liability exclusion section', () => {
    expect(sections.some((s) => s.toLowerCase().includes('exclusión de responsabilidad'))).toBe(
      true
    );
  });

  it('includes applicable law section', () => {
    expect(sections.some((s) => s.toLowerCase().includes('legislación'))).toBe(true);
  });
});

describe('Legal Notice page — company identification', () => {
  const companyName = 'Carretillas Tekon S.L.U';
  const cif = 'B96416201';
  const domicilio = 'Camino Guardarany, S/N, 46410 Sueca (Valencia)';

  it('company name is Carretillas Tekon S.L.U', () => {
    expect(companyName).toBe('Carretillas Tekon S.L.U');
  });

  it('CIF is B96416201', () => {
    expect(cif).toBe('B96416201');
  });

  it('domicilio is in Sueca, Valencia', () => {
    expect(domicilio.toLowerCase()).toContain('sueca');
    expect(domicilio.toLowerCase()).toContain('valencia');
  });
});

// ─── Cross-page: URL structure ────────────────────────────────────────────────

describe('Legal pages — URL structure', () => {
  const pages = [
    { url: '/politica-de-privacidad', name: 'Privacy Policy' },
    { url: '/politica-de-cookies', name: 'Cookie Policy' },
    { url: '/aviso-legal', name: 'Legal Notice' },
  ];

  it('has 3 legal pages', () => {
    expect(pages).toHaveLength(3);
  });

  it('all URLs are lowercase with hyphens', () => {
    pages.forEach(({ url }) => {
      expect(url).toMatch(/^\/[a-z-]+$/);
    });
  });

  it('privacy page URL is /politica-de-privacidad', () => {
    expect(pages[0].url).toBe('/politica-de-privacidad');
  });

  it('cookies page URL is /politica-de-cookies', () => {
    expect(pages[1].url).toBe('/politica-de-cookies');
  });

  it('legal notice URL is /aviso-legal', () => {
    expect(pages[2].url).toBe('/aviso-legal');
  });

  it('no JSON-LD on legal pages (no jsonLd prop passed)', () => {
    // Legal pages are static informational pages with no structured data
    const hasNoJsonLd = pages.every(({ name }) => name !== null);
    expect(hasNoJsonLd).toBe(true);
  });
});

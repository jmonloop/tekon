/**
 * Validation tests for .claude/extracted/ output
 * Run with: node scripts/validate-extracted.test.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXTRACTED_DIR = join(__dirname, '../.claude/extracted');

// Simple test runner
let passed = 0;
let failed = 0;

function describe(label, fn) {
  console.log(`\n${label}`);
  fn();
}

function it(label, fn) {
  try {
    fn();
    console.log(`  ✓ ${label}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${label}`);
    console.log(`    ${err.message}`);
    failed++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThan(n) {
      if (!(actual > n)) throw new Error(`Expected ${actual} > ${n}`);
    },
    toBeGreaterThanOrEqual(n) {
      if (!(actual >= n)) throw new Error(`Expected ${actual} >= ${n}`);
    },
    toBeLessThan(n) {
      if (!(actual < n)) throw new Error(`Expected ${actual} < ${n}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`);
    },
    toHaveLength(n) {
      if (actual.length !== n) throw new Error(`Expected length ${n}, got ${actual.length}`);
    },
    toContain(substr) {
      if (typeof actual === 'string' && !actual.includes(substr)) {
        throw new Error(`Expected string to contain "${substr}"`);
      }
      if (Array.isArray(actual) && !actual.includes(substr)) {
        throw new Error(`Expected array to contain ${JSON.stringify(substr)}`);
      }
    },
    toMatch(pattern) {
      if (!pattern.test(actual)) throw new Error(`Expected "${actual}" to match ${pattern}`);
    },
    not: {
      toBe(expected) {
        if (actual === expected) throw new Error(`Expected NOT ${JSON.stringify(expected)}`);
      },
      toBeFalsy() {
        if (!actual) throw new Error(`Expected truthy value`);
      },
    },
  };
}

// Load files
const forklifts = JSON.parse(readFileSync(join(EXTRACTED_DIR, 'forklifts.json'), 'utf8'));
const brand = JSON.parse(readFileSync(join(EXTRACTED_DIR, 'brand.json'), 'utf8'));
const categories = JSON.parse(readFileSync(join(EXTRACTED_DIR, 'categories.json'), 'utf8'));
const summary = JSON.parse(readFileSync(join(EXTRACTED_DIR, 'summary.json'), 'utf8'));

// --- Tests ---

describe('Required files exist', () => {
  const requiredFiles = [
    'forklifts.json',
    'brand.json',
    'categories.json',
    'about.txt',
    'solutions.txt',
    'privacy.txt',
    'cookies.txt',
    'legal-notice.txt',
    'summary.json',
  ];

  for (const file of requiredFiles) {
    it(`${file} exists`, () => {
      expect(existsSync(join(EXTRACTED_DIR, file))).toBeTruthy();
    });
  }
});

describe('forklifts.json — structure', () => {
  it('should have at least 20 forklifts', () => {
    expect(forklifts.length).toBeGreaterThanOrEqual(20);
  });

  it('each forklift has required string fields', () => {
    for (const f of forklifts) {
      if (!f.name || typeof f.name !== 'string') throw new Error(`Missing name in ${f.slug}`);
      if (!f.slug || typeof f.slug !== 'string') throw new Error(`Missing slug in ${f.name}`);
      if (typeof f.category !== 'string') throw new Error(`Missing category in ${f.name}`);
      if (typeof f.description !== 'string') throw new Error(`Missing description in ${f.name}`);
      if (typeof f.short_description !== 'string') throw new Error(`Missing short_description in ${f.name}`);
      if (typeof f.image_url !== 'string') throw new Error(`Missing image_url in ${f.name}`);
    }
  });

  it('each forklift has boolean availability fields', () => {
    for (const f of forklifts) {
      if (typeof f.available_for_sale !== 'boolean') throw new Error(`Missing available_for_sale in ${f.name}`);
      if (typeof f.available_for_rental !== 'boolean') throw new Error(`Missing available_for_rental in ${f.name}`);
      if (typeof f.available_as_used !== 'boolean') throw new Error(`Missing available_as_used in ${f.name}`);
    }
  });

  it('each forklift has a specs array', () => {
    for (const f of forklifts) {
      if (!Array.isArray(f.specs)) throw new Error(`Missing specs array in ${f.name}`);
    }
  });

  it('slugs are URL-safe (lowercase, no spaces)', () => {
    for (const f of forklifts) {
      if (!/^[a-z0-9-]+$/.test(f.slug)) {
        throw new Error(`Invalid slug "${f.slug}" for ${f.name}`);
      }
    }
  });

  it('slugs are unique', () => {
    const slugs = forklifts.map(f => f.slug);
    const unique = new Set(slugs);
    if (unique.size !== slugs.length) {
      throw new Error(`Duplicate slugs found: ${slugs.filter((s, i) => slugs.indexOf(s) !== i).join(', ')}`);
    }
  });

  it('names are non-empty and not too long', () => {
    for (const f of forklifts) {
      if (f.name.length === 0) throw new Error(`Empty name for ${f.slug}`);
      if (f.name.length > 100) throw new Error(`Name too long for ${f.slug}: "${f.name}"`);
    }
  });
});

describe('forklifts.json — content quality', () => {
  it('majority of forklifts have descriptions', () => {
    const withDesc = forklifts.filter(f => f.description.length > 20);
    expect(withDesc.length).toBeGreaterThan(forklifts.length * 0.8);
  });

  it('majority of forklifts have images', () => {
    const withImg = forklifts.filter(f => f.image_url.length > 0);
    expect(withImg.length).toBeGreaterThan(forklifts.length * 0.8);
  });

  it('image URLs point to wp-content/uploads', () => {
    for (const f of forklifts.filter(f => f.image_url)) {
      if (!f.image_url.includes('/wp-content/uploads/')) {
        throw new Error(`Unexpected image URL for ${f.name}: ${f.image_url}`);
      }
    }
  });

  it('catalog PDF URLs end in .pdf', () => {
    for (const f of forklifts.filter(f => f.catalog_pdf_url)) {
      if (!f.catalog_pdf_url.endsWith('.pdf')) {
        throw new Error(`Invalid PDF URL for ${f.name}: ${f.catalog_pdf_url}`);
      }
    }
  });

  it('at least one forklift available for sale', () => {
    expect(forklifts.filter(f => f.available_for_sale).length).toBeGreaterThan(0);
  });

  it('at least one forklift available for rental', () => {
    expect(forklifts.filter(f => f.available_for_rental).length).toBeGreaterThan(0);
  });

  it('at least one forklift available as used', () => {
    expect(forklifts.filter(f => f.available_as_used).length).toBeGreaterThan(0);
  });

  it('short_description is shorter than or equal to description', () => {
    for (const f of forklifts) {
      if (f.short_description.length > f.description.length + 5) {
        throw new Error(`short_description longer than description for ${f.name}`);
      }
    }
  });

  it('specs have spec_name, spec_value, spec_unit, sort_order', () => {
    for (const f of forklifts) {
      for (const spec of f.specs) {
        if (typeof spec.spec_name !== 'string') throw new Error(`Missing spec_name in spec of ${f.name}`);
        if (typeof spec.spec_value !== 'string') throw new Error(`Missing spec_value in spec of ${f.name}`);
        if (typeof spec.spec_unit !== 'string') throw new Error(`Missing spec_unit in spec of ${f.name}`);
        if (typeof spec.sort_order !== 'number') throw new Error(`Missing sort_order in spec of ${f.name}`);
      }
    }
  });

  it('majority of forklifts have at least one spec', () => {
    const withSpecs = forklifts.filter(f => f.specs.length > 0);
    expect(withSpecs.length).toBeGreaterThan(forklifts.length * 0.6);
  });
});

describe('brand.json', () => {
  it('has logo_url', () => {
    expect(brand.logo_url).toBeTruthy();
    expect(brand.logo_url).toContain('carretillastekon.com');
  });

  it('has brand green hex color', () => {
    expect(brand.brand_green_hex).toBeTruthy();
    expect(brand.brand_green_hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('has contact info', () => {
    expect(brand.contact).toBeTruthy();
    expect(brand.contact.phone_landline).toBeTruthy();
    expect(brand.contact.address).toBeTruthy();
  });

  it('has geo coordinates', () => {
    expect(brand.contact.geo.lat).toBeGreaterThan(38);
    expect(brand.contact.geo.lat).toBeLessThan(41);
    expect(brand.contact.geo.lng).toBeGreaterThan(-2);
    expect(brand.contact.geo.lng).toBeLessThan(0);
  });
});

describe('categories.json', () => {
  it('has at least 5 categories', () => {
    expect(categories.length).toBeGreaterThanOrEqual(5);
  });

  it('each category has name, slug, sort_order', () => {
    for (const cat of categories) {
      if (!cat.name || typeof cat.name !== 'string') throw new Error(`Missing name in category`);
      if (!cat.slug || typeof cat.slug !== 'string') throw new Error(`Missing slug for category ${cat.name}`);
      if (typeof cat.sort_order !== 'number') throw new Error(`Missing sort_order for category ${cat.name}`);
    }
  });

  it('category slugs are URL-safe', () => {
    for (const cat of categories) {
      if (!/^[a-z0-9-]+$/.test(cat.slug)) {
        throw new Error(`Invalid slug "${cat.slug}" for category ${cat.name}`);
      }
    }
  });

  it('category slugs are unique', () => {
    const slugs = categories.map(c => c.slug);
    const unique = new Set(slugs);
    if (unique.size !== slugs.length) {
      throw new Error(`Duplicate category slugs`);
    }
  });

  it('every forklift category matches a known category', () => {
    const catNames = new Set(categories.map(c => c.name));
    for (const f of forklifts.filter(f => f.category)) {
      if (!catNames.has(f.category)) {
        throw new Error(`Forklift ${f.name} has unknown category "${f.category}"`);
      }
    }
  });
});

describe('static page files', () => {
  it('about.txt has substantial content', () => {
    const text = readFileSync(join(EXTRACTED_DIR, 'about.txt'), 'utf8');
    expect(text.length).toBeGreaterThan(200);
    expect(text.toLowerCase()).toContain('tekon');
  });

  it('solutions.txt has substantial content', () => {
    const text = readFileSync(join(EXTRACTED_DIR, 'solutions.txt'), 'utf8');
    expect(text.length).toBeGreaterThan(100);
  });

  it('privacy.txt has substantial content', () => {
    const text = readFileSync(join(EXTRACTED_DIR, 'privacy.txt'), 'utf8');
    expect(text.length).toBeGreaterThan(500);
  });

  it('legal-notice.txt has substantial content', () => {
    const text = readFileSync(join(EXTRACTED_DIR, 'legal-notice.txt'), 'utf8');
    expect(text.length).toBeGreaterThan(500);
  });
});

describe('summary.json', () => {
  it('has correct totals', () => {
    expect(summary.total_forklifts).toBe(forklifts.length);
    expect(summary.total_categories).toBe(categories.length);
  });

  it('has scraped_at timestamp', () => {
    expect(summary.scraped_at).toBeTruthy();
    expect(new Date(summary.scraped_at).getFullYear()).toBeGreaterThanOrEqual(2026);
  });
});

// --- Results ---
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) process.exit(1);

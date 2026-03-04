import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const MIGRATIONS_DIR = join(process.cwd(), 'supabase/migrations');

function readMigration(filename: string): string {
  return readFileSync(join(MIGRATIONS_DIR, filename), 'utf-8');
}

describe('Supabase database schema', () => {
  describe('Migration files exist', () => {
    const expectedFiles = [
      '20260304000000_create_categories.sql',
      '20260304000001_create_forklifts.sql',
      '20260304000002_create_forklift_specs.sql',
      '20260304000003_create_inquiries.sql',
      '20260304000006_seed_data.sql',
    ];

    for (const file of expectedFiles) {
      it(`has ${file}`, () => {
        expect(existsSync(join(MIGRATIONS_DIR, file))).toBe(true);
      });
    }
  });

  describe('categories table', () => {
    const sql = readMigration('20260304000000_create_categories.sql');

    it('creates categories table with required columns', () => {
      expect(sql).toContain('CREATE TABLE categories');
      expect(sql).toContain('id uuid PRIMARY KEY DEFAULT gen_random_uuid()');
      expect(sql).toContain('name text NOT NULL');
      expect(sql).toContain('slug text NOT NULL UNIQUE');
      expect(sql).toContain('sort_order int NOT NULL DEFAULT 0');
    });

    it('creates indexes on slug and sort_order', () => {
      expect(sql).toContain('CREATE INDEX idx_categories_slug ON categories (slug)');
      expect(sql).toContain('CREATE INDEX idx_categories_sort ON categories (sort_order)');
    });
  });

  describe('forklifts table', () => {
    const sql = readMigration('20260304000001_create_forklifts.sql');

    it('creates forklifts table with required columns', () => {
      expect(sql).toContain('CREATE TABLE forklifts');
      expect(sql).toContain('id uuid PRIMARY KEY DEFAULT gen_random_uuid()');
      expect(sql).toContain('name text NOT NULL');
      expect(sql).toContain('slug text NOT NULL UNIQUE');
      expect(sql).toContain('is_published boolean NOT NULL DEFAULT false');
      expect(sql).toContain('available_for_sale boolean NOT NULL DEFAULT false');
      expect(sql).toContain('available_for_rental boolean NOT NULL DEFAULT false');
      expect(sql).toContain('available_as_used boolean NOT NULL DEFAULT false');
    });

    it('has FK to categories with ON DELETE RESTRICT', () => {
      expect(sql).toContain('category_id uuid NOT NULL REFERENCES categories (id) ON DELETE RESTRICT');
    });

    it('has created_at and updated_at timestamp columns', () => {
      expect(sql).toContain('created_at timestamptz NOT NULL DEFAULT now()');
      expect(sql).toContain('updated_at timestamptz NOT NULL DEFAULT now()');
    });

    it('has generated fts tsvector column with Spanish config', () => {
      expect(sql).toContain("fts tsvector GENERATED ALWAYS AS");
      expect(sql).toContain("to_tsvector('spanish'");
      expect(sql).toContain('STORED');
    });

    it('has weighted fts with A, B, C weights', () => {
      expect(sql).toContain("setweight(to_tsvector('spanish', coalesce(name, '')), 'A')");
      expect(sql).toContain("setweight(to_tsvector('spanish', coalesce(short_description, '')), 'B')");
      expect(sql).toContain("setweight(to_tsvector('spanish', coalesce(description, '')), 'C')");
    });

    it('has GIN index on fts column', () => {
      expect(sql).toContain('CREATE INDEX idx_forklifts_fts ON forklifts USING GIN (fts)');
    });

    it('has partial indexes for boolean filter columns', () => {
      expect(sql).toContain('CREATE INDEX idx_forklifts_published ON forklifts (is_published) WHERE is_published = true');
      expect(sql).toContain('CREATE INDEX idx_forklifts_sale ON forklifts (available_for_sale) WHERE available_for_sale = true');
      expect(sql).toContain('CREATE INDEX idx_forklifts_rental ON forklifts (available_for_rental) WHERE available_for_rental = true');
      expect(sql).toContain('CREATE INDEX idx_forklifts_used ON forklifts (available_as_used) WHERE available_as_used = true');
    });

    it('has updated_at trigger function', () => {
      expect(sql).toContain('CREATE OR REPLACE FUNCTION update_updated_at()');
      expect(sql).toContain('NEW.updated_at = now()');
      expect(sql).toContain('RETURNS TRIGGER');
      expect(sql).toContain('LANGUAGE plpgsql');
    });

    it('has set_updated_at trigger on forklifts', () => {
      expect(sql).toContain('CREATE TRIGGER set_updated_at');
      expect(sql).toContain('BEFORE UPDATE ON forklifts');
      expect(sql).toContain('EXECUTE FUNCTION update_updated_at()');
    });

    it('has search_forklifts RPC function', () => {
      expect(sql).toContain('CREATE OR REPLACE FUNCTION search_forklifts(search_query text)');
      expect(sql).toContain('RETURNS TABLE');
      expect(sql).toContain('category_name text');
      expect(sql).toContain('rank real');
    });

    it('search_forklifts joins categories and filters by is_published', () => {
      expect(sql).toContain('JOIN categories c ON f.category_id = c.id');
      expect(sql).toContain('AND f.is_published = true');
      expect(sql).toContain("plainto_tsquery('spanish', search_query)");
    });

    it('search_forklifts is STABLE function', () => {
      expect(sql).toContain('LANGUAGE plpgsql STABLE');
    });
  });

  describe('forklift_specs table', () => {
    const sql = readMigration('20260304000002_create_forklift_specs.sql');

    it('creates forklift_specs table with required columns', () => {
      expect(sql).toContain('CREATE TABLE forklift_specs');
      expect(sql).toContain('id uuid PRIMARY KEY DEFAULT gen_random_uuid()');
      expect(sql).toContain('spec_name text NOT NULL');
      expect(sql).toContain('spec_value text NOT NULL');
      expect(sql).toContain('spec_unit text');
      expect(sql).toContain('sort_order int NOT NULL DEFAULT 0');
    });

    it('has FK to forklifts with ON DELETE CASCADE', () => {
      expect(sql).toContain('forklift_id uuid NOT NULL REFERENCES forklifts (id) ON DELETE CASCADE');
    });

    it('creates indexes on forklift_id and spec_name', () => {
      expect(sql).toContain('CREATE INDEX idx_specs_forklift ON forklift_specs (forklift_id)');
      expect(sql).toContain('CREATE INDEX idx_specs_name ON forklift_specs (spec_name)');
    });
  });

  describe('inquiries table', () => {
    const sql = readMigration('20260304000003_create_inquiries.sql');

    it('creates inquiries table with required columns', () => {
      expect(sql).toContain('CREATE TABLE inquiries');
      expect(sql).toContain('id uuid PRIMARY KEY DEFAULT gen_random_uuid()');
      expect(sql).toContain('name text NOT NULL');
      expect(sql).toContain('email text NOT NULL');
      expect(sql).toContain('message text NOT NULL');
      expect(sql).toContain('read boolean NOT NULL DEFAULT false');
      expect(sql).toContain('created_at timestamptz NOT NULL DEFAULT now()');
    });

    it('has nullable FK to forklifts with ON DELETE SET NULL', () => {
      expect(sql).toContain('forklift_id uuid REFERENCES forklifts (id) ON DELETE SET NULL');
      // forklift_id must NOT have NOT NULL (it's nullable)
      expect(sql).not.toContain('forklift_id uuid NOT NULL REFERENCES forklifts');
    });

    it('creates partial index on unread inquiries', () => {
      expect(sql).toContain('CREATE INDEX idx_inquiries_read ON inquiries (read) WHERE read = false');
    });

    it('creates index on created_at DESC for sorted listing', () => {
      expect(sql).toContain('CREATE INDEX idx_inquiries_created ON inquiries (created_at DESC)');
    });
  });

  describe('Seed data', () => {
    const sql = readMigration('20260304000006_seed_data.sql');

    it('inserts all 9 categories', () => {
      const categoryInserts = [
        'apiladores-electricos',
        'transpaletas-electricas',
        'transpaletas-manuales',
        'carretillas-electricas-3-ruedas',
        'carretillas-electricas-4-ruedas',
        'carretillas-retractiles',
        'preparadoras-de-pedidos-de-bajo-nivel',
        'carretillas-diesel',
        'soluciones-de-remolque',
      ];
      for (const slug of categoryInserts) {
        expect(sql).toContain(slug);
      }
    });

    it('has no duplicate forklift slugs', () => {
      const slugMatches = [...sql.matchAll(/INSERT INTO forklifts.*?\nVALUES \(\n\s+'[^']+', '([^']+)'/gs)];
      const slugs = slugMatches.map((m) => m[1]);
      const unique = new Set(slugs);
      expect(slugs.length).toBe(unique.size);
    });

    it('inserts forklifts referencing categories by slug subquery', () => {
      expect(sql).toContain('SELECT id FROM categories WHERE slug =');
    });

    it('inserts specs referencing forklifts by slug subquery', () => {
      expect(sql).toContain('SELECT id FROM forklifts WHERE slug =');
    });

    it('seeds known forklifts from extracted data', () => {
      expect(sql).toContain("'s100'");
      expect(sql).toContain("'s300'");
      expect(sql).toContain("'r100'");
      expect(sql).toContain("'b400'");
    });
  });
});

-- Migration: Create forklifts table
-- Main product table with Spanish full-text search via generated tsvector column

CREATE TABLE forklifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
  description text NOT NULL DEFAULT '',
  short_description text NOT NULL DEFAULT '',
  image_url text,
  catalog_pdf_url text,
  available_for_sale boolean NOT NULL DEFAULT false,
  available_for_rental boolean NOT NULL DEFAULT false,
  available_as_used boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(short_description, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(description, '')), 'C')
  ) STORED
);

CREATE INDEX idx_forklifts_slug ON forklifts (slug);
CREATE INDEX idx_forklifts_category ON forklifts (category_id);
CREATE INDEX idx_forklifts_published ON forklifts (is_published) WHERE is_published = true;
CREATE INDEX idx_forklifts_sale ON forklifts (available_for_sale) WHERE available_for_sale = true;
CREATE INDEX idx_forklifts_rental ON forklifts (available_for_rental) WHERE available_for_rental = true;
CREATE INDEX idx_forklifts_used ON forklifts (available_as_used) WHERE available_as_used = true;
CREATE INDEX idx_forklifts_fts ON forklifts USING GIN (fts);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON forklifts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RPC function for full-text search including category name
CREATE OR REPLACE FUNCTION search_forklifts(search_query text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  short_description text,
  image_url text,
  category_name text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id, f.name, f.slug, f.short_description, f.image_url,
    c.name AS category_name,
    ts_rank(
      f.fts || to_tsvector('spanish', coalesce(c.name, '')),
      plainto_tsquery('spanish', search_query)
    ) AS rank
  FROM forklifts f
  JOIN categories c ON f.category_id = c.id
  WHERE (f.fts || to_tsvector('spanish', coalesce(c.name, '')))
        @@ plainto_tsquery('spanish', search_query)
    AND f.is_published = true
  ORDER BY rank DESC
  LIMIT 8;
END;
$$ LANGUAGE plpgsql STABLE;

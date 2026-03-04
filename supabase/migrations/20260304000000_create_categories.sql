-- Migration: Create categories table
-- Categories for forklift products (EAV parent)

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0
);

CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_categories_sort ON categories (sort_order);

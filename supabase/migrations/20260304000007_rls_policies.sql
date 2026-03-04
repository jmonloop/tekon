-- Migration: Enable RLS and create row-level security policies
-- Anon: SELECT published forklifts/specs/categories, INSERT inquiries
-- Authenticated (admin): full CRUD on all tables

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forklifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forklift_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- categories
-- ============================================================

-- Public can read all categories
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);

-- Authenticated admin has full access
CREATE POLICY "Admin full access to categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- forklifts
-- ============================================================

-- Public can read published forklifts only
CREATE POLICY "Public can read published forklifts"
  ON forklifts FOR SELECT
  USING (is_published = true);

-- Authenticated admin has full access (including unpublished)
CREATE POLICY "Admin full access to forklifts"
  ON forklifts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- forklift_specs
-- ============================================================

-- Public can read specs only when the parent forklift is published
CREATE POLICY "Public can read specs of published forklifts"
  ON forklift_specs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forklifts
      WHERE forklifts.id = forklift_specs.forklift_id
        AND forklifts.is_published = true
    )
  );

-- Authenticated admin has full access to all specs
CREATE POLICY "Admin full access to forklift_specs"
  ON forklift_specs FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- inquiries
-- ============================================================

-- Public can submit inquiries (contact form)
CREATE POLICY "Public can submit inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

-- Authenticated admin can read, update, and delete inquiries
CREATE POLICY "Admin can manage inquiries"
  ON inquiries FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

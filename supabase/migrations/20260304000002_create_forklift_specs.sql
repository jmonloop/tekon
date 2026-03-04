-- Migration: Create forklift_specs table
-- EAV pattern for flexible spec storage per forklift product

CREATE TABLE forklift_specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forklift_id uuid NOT NULL REFERENCES forklifts (id) ON DELETE CASCADE,
  spec_name text NOT NULL,
  spec_value text NOT NULL,
  spec_unit text,
  sort_order int NOT NULL DEFAULT 0
);

CREATE INDEX idx_specs_forklift ON forklift_specs (forklift_id);
CREATE INDEX idx_specs_name ON forklift_specs (spec_name);

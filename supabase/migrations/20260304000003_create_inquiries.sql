-- Migration: Create inquiries table
-- Contact form submissions; forklift_id nullable (SET NULL on forklift delete)

CREATE TABLE inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  forklift_id uuid REFERENCES forklifts (id) ON DELETE SET NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inquiries_read ON inquiries (read) WHERE read = false;
CREATE INDEX idx_inquiries_created ON inquiries (created_at DESC);

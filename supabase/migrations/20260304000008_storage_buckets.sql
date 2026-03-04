-- Migration: Set up Supabase Storage buckets
-- Creates two public buckets:
--   forklift-images: 5MB max, JPG/PNG/WebP
--   forklift-catalogs: 10MB max, PDF
-- RLS: public read, authenticated upload/update/delete

-- ============================================================
-- Buckets
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'forklift-images',
    'forklift-images',
    true,
    5242880, -- 5MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'forklift-catalogs',
    'forklift-catalogs',
    true,
    10485760, -- 10MB in bytes
    ARRAY['application/pdf']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================
-- RLS policies for storage.objects
-- ============================================================

-- forklift-images: public read
CREATE POLICY "Public can read forklift images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'forklift-images');

-- forklift-images: authenticated upload
CREATE POLICY "Authenticated can upload forklift images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'forklift-images'
    AND auth.role() = 'authenticated'
  );

-- forklift-images: authenticated update
CREATE POLICY "Authenticated can update forklift images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'forklift-images'
    AND auth.role() = 'authenticated'
  );

-- forklift-images: authenticated delete
CREATE POLICY "Authenticated can delete forklift images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'forklift-images'
    AND auth.role() = 'authenticated'
  );

-- forklift-catalogs: public read
CREATE POLICY "Public can read forklift catalogs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'forklift-catalogs');

-- forklift-catalogs: authenticated upload
CREATE POLICY "Authenticated can upload forklift catalogs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'forklift-catalogs'
    AND auth.role() = 'authenticated'
  );

-- forklift-catalogs: authenticated update
CREATE POLICY "Authenticated can update forklift catalogs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'forklift-catalogs'
    AND auth.role() = 'authenticated'
  );

-- forklift-catalogs: authenticated delete
CREATE POLICY "Authenticated can delete forklift catalogs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'forklift-catalogs'
    AND auth.role() = 'authenticated'
  );

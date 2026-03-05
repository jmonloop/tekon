-- Fix search_forklifts to use ILIKE substring matching instead of FTS.
-- plainto_tsquery / prefix tsquery are unreliable for alphanumeric model numbers
-- like "B600" under the Spanish dictionary. ILIKE guarantees substring matching
-- for any input and is efficient for a product catalogue of this size.

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
  IF trim(search_query) = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    f.id,
    f.name,
    f.slug,
    f.short_description,
    f.image_url,
    c.name AS category_name,
    CASE
      WHEN f.name ILIKE '%' || search_query || '%' THEN 1.0
      WHEN c.name ILIKE '%' || search_query || '%' THEN 0.8
      ELSE 0.5
    END::real AS rank
  FROM forklifts f
  JOIN categories c ON f.category_id = c.id
  WHERE (
    f.name             ILIKE '%' || search_query || '%'
    OR f.short_description ILIKE '%' || search_query || '%'
    OR f.description       ILIKE '%' || search_query || '%'
    OR c.name              ILIKE '%' || search_query || '%'
  )
    AND f.is_published = true
  ORDER BY rank DESC
  LIMIT 8;
END;
$$ LANGUAGE plpgsql STABLE;

/**
 * Fix forklift image URLs by scraping CSS background-image from each product page.
 * The original scraper only looked at <img> tags; the actual product images are
 * loaded as CSS background-image in Elementor widgets.
 *
 * Outputs: SQL UPDATE statements to fix image_url in the forklifts table.
 */

const BASE_URL = 'https://www.carretillastekon.com';

const slugs = [
  's100', 's300', 's200', 's010i', 'r300-2', 'r200', 'r100',
  'b400', 'b600', 'b800', 'b200', 'b300',
  'tte-71', 'tte-40', 'tte-30', 'te-80ixb', 'tte-15', 'te-80',
  'te-500rr', 'te-300r', 'te-291', 'te-152',
  'pe-30', 'pe-20', 'pe15',
  'p300', 'p216i', 'p200', 'p100', 'p013i',
  'o125-o125p', 'o112p', 'o120x', 'o112cb', 'o112', 'o110',
  'ce-h', 'ce',
  'r300', 'm300tc-stage-v', 'm300h',
  'nissan-dx25', 'om-tsx20', 'nissan-gq02l30cu', 'om-thesi',
];

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TekonImageFixer/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function extractSinglePageSection(html) {
  const singleIdx = html.indexOf('data-elementor-type="single-page"');
  const footerIdx = html.indexOf('data-elementor-type="footer"');
  if (singleIdx === -1) return '';
  const end = footerIdx > singleIdx ? footerIdx : html.length;
  return html.slice(singleIdx, end);
}

function extractBestImage(html) {
  // Product images on this Elementor site are set as CSS background-image in <head> inline styles.
  // Search the full HTML (not just the body section) for background-image with wp-content/uploads.
  const bgMatches = [];
  const bgRegex = /background-image:\s*url\(['"]?(https?:[^'")\s]+)['"]?\)/gi;
  let m;
  while ((m = bgRegex.exec(html)) !== null) {
    const url = m[1];
    if (
      url.includes('/wp-content/uploads/') &&
      !url.includes('Tecon_green') &&
      !url.includes('tekon.jpg') &&
      !url.includes('arrow_') &&
      !url.toLowerCase().includes('facebook') &&
      !url.toLowerCase().includes('instagram') &&
      !url.toLowerCase().includes('logo') &&
      !url.toLowerCase().includes('banner') &&
      !url.toLowerCase().includes('fondo')
    ) {
      bgMatches.push(url);
    }
  }

  if (bgMatches.length > 0) return bgMatches[0];

  // Fallback: <img> tags in the single-page section (excluding thumbnails/logos)
  const singleIdx = html.indexOf('data-elementor-type="single-page"');
  const footerIdx = html.indexOf('data-elementor-type="footer"');
  const section = singleIdx !== -1
    ? html.slice(singleIdx, footerIdx > singleIdx ? footerIdx : html.length)
    : html;

  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((m = imgRegex.exec(section)) !== null) {
    const src = m[1];
    if (
      src.includes('/wp-content/uploads/') &&
      !src.includes('Tecon_green') &&
      !src.includes('tekon.jpg') &&
      !src.includes('arrow_') &&
      !src.includes('-150x') &&
      !src.includes('-300x') &&
      !src.toLowerCase().includes('facebook') &&
      !src.toLowerCase().includes('instagram') &&
      !src.toLowerCase().includes('logo')
    ) {
      return src;
    }
  }

  return null;
}

async function getImageForSlug(slug) {
  const url = `${BASE_URL}/carretillas/${slug}/`;
  try {
    const html = await fetchPage(url);
    const section = extractSinglePageSection(html);
    const image = extractBestImage(html);
    return { slug, image_url: image, error: null };
  } catch (err) {
    return { slug, image_url: null, error: err.message };
  }
}

// Process in batches to avoid rate limiting
async function processInBatches(items, batchSize, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    if (i + batchSize < items.length) {
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  return results;
}

console.log(`Fetching images for ${slugs.length} products...\n`);

const results = await processInBatches(slugs, 5, getImageForSlug);

console.log('-- SQL UPDATE statements to fix image_url in forklifts table');
console.log('-- Run these against your Supabase database\n');

let fixed = 0;
let failed = 0;

for (const { slug, image_url, error } of results) {
  if (error) {
    console.error(`-- ERROR for ${slug}: ${error}`);
    failed++;
  } else if (image_url) {
    const escaped = image_url.replace(/'/g, "''");
    console.log(`UPDATE forklifts SET image_url = '${escaped}' WHERE slug = '${slug}';`);
    fixed++;
  } else {
    console.log(`-- WARNING: no image found for ${slug}`);
    failed++;
  }
}

console.log(`\n-- Summary: ${fixed} fixed, ${failed} failed/missing`);

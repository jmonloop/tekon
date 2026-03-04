/**
 * Tekon WordPress site scraper
 * Extracts forklifts, brand assets, company text, and legal documents
 * Saves structured output to .claude/extracted/
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../.claude/extracted');
const BASE_URL = 'https://www.carretillastekon.com';

mkdirSync(OUTPUT_DIR, { recursive: true });

// --- HTML utilities ---

function cleanText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '...')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSinglePageSection(html) {
  const singleIdx = html.indexOf('data-elementor-type="single-page"');
  const footerIdx = html.indexOf('data-elementor-type="footer"');
  if (singleIdx === -1) return '';
  const end = footerIdx > singleIdx ? footerIdx : html.length;
  return html.slice(singleIdx, end);
}

function extractFirstHeading(sectionHtml) {
  const m = sectionHtml.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/);
  return m ? cleanText(m[1]) : '';
}

function extractTextEditorContents(sectionHtml) {
  // Find all elementor-widget-text-editor widget containers
  const results = [];
  const regex = /elementor-widget-text-editor[^>]*>[\s\S]*?<div class="elementor-widget-container">([\s\S]*?)<\/div>\s*<\/div>/g;
  let m;
  while ((m = regex.exec(sectionHtml)) !== null) {
    const text = cleanText(m[1]);
    if (text.length > 20) results.push(text);
  }
  return results;
}

function extractSpecsFromTable(sectionHtml) {
  const specs = [];

  // Find actual HTML tables in the single-page section
  const tableRegex = /<table[\s\S]*?<\/table>/gi;
  let tableMatch;
  while ((tableMatch = tableRegex.exec(sectionHtml)) !== null) {
    const tableHtml = tableMatch[0];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const rowHtml = rowMatch[1];
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const cells = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        cells.push(cleanText(cellMatch[1]));
      }
      if (cells.length >= 2 && cells[0] && cells[1]) {
        const specName = cells[0];
        const rawValue = cells[1];
        // Skip header rows
        if (specName.toLowerCase() === 'modelo' || specName === specName.toUpperCase() && specName.length < 10) continue;

        // Extract numeric value and unit from value string
        const unitMatch = rawValue.match(/^([\d.,/\s-]+)\s*([a-zA-Z%°]+(?:\/[a-zA-Z]+)?)$/);
        if (unitMatch) {
          specs.push({
            spec_name: specName,
            spec_value: unitMatch[1].trim(),
            spec_unit: unitMatch[2],
            sort_order: specs.length,
          });
        } else {
          specs.push({
            spec_name: specName,
            spec_value: rawValue,
            spec_unit: '',
            sort_order: specs.length,
          });
        }
      }
    }
  }

  // Deduplicate by spec_name (keep first occurrence)
  const seen = new Set();
  return specs.filter(s => {
    if (seen.has(s.spec_name)) return false;
    seen.add(s.spec_name);
    return true;
  });
}

function extractImages(sectionHtml) {
  const results = [];
  const srcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = srcRegex.exec(sectionHtml)) !== null) {
    const src = m[1];
    if (
      src.includes('/wp-content/uploads/') &&
      !src.includes('Tecon_green') &&
      !src.includes('tekon.jpg') &&
      !src.includes('arrow_') &&
      !src.includes('-150x') &&
      !src.includes('-300x') &&
      !src.toLowerCase().includes('facebook') &&
      !src.toLowerCase().includes('instagram')
    ) {
      results.push(src);
    }
  }
  return [...new Set(results)];
}

function extractPdfLink(sectionHtml) {
  const m = sectionHtml.match(/href=["']([^"']+\.pdf)["']/i);
  return m ? m[1] : '';
}

function extractNameFromTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/);
  if (!m) return '';
  return cleanText(m[1].split('&#8211;')[0].split(' – ')[0]).trim();
}

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// --- Fetch ---

async function fetchPage(url) {
  console.log(`  Fetching: ${url}`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TekonScraper/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// --- Collect all forklift URLs from listing pages ---

async function collectListingPage(url, sectionType) {
  const html = await fetchPage(url);

  // Extract forklift slug + category pairs from listing cards
  // Pattern: category link near forklift link within the same card
  const results = [];

  // Each product card has: category link + forklift link
  // Find card containers - they wrap both category tag and "SABER MÁS" link
  const cardRegex = /\/carretillas\/([^/"]+)\//g;
  let m;
  const slugsOnPage = [];
  while ((m = cardRegex.exec(html)) !== null) {
    const slug = m[1];
    const position = m.index;

    // Look backwards from the forklift link for the nearest category link
    const before = html.slice(Math.max(0, position - 3000), position);
    const catMatch = before.match(/marca-de-carretilla\/([^/"]+)\/"[^>]*>([^<]+)<\/a>(?![\s\S]{0,100}\/carretillas\/)/);
    const lastCat = before.match(/marca-de-carretilla\/([^/"]+)\/"[^>]*>([^<]+)<\/a>/g);
    let category = '';
    if (lastCat && lastCat.length > 0) {
      const lastCatStr = lastCat[lastCat.length - 1];
      const catTextMatch = lastCatStr.match(/>([^<]+)<\/a>/);
      category = catTextMatch ? cleanText(catTextMatch[1]) : '';
    }

    slugsOnPage.push({ slug, category, sectionType });
  }
  results.push(...slugsOnPage);

  // Get next page
  const nextMatch = html.match(/href=["']([^"']+\/\d+\/)["'][^>]*>[^<]*Siguiente/i);
  return { results, nextPage: nextMatch ? nextMatch[1] : null };
}

async function collectAllForkliftData() {
  const sections = [
    { url: `${BASE_URL}/venta-de-carretillas/`, type: 'sale' },
    { url: `${BASE_URL}/alquiler-de-carretillas/`, type: 'rental' },
    { url: `${BASE_URL}/carretillas-de-segunda-mano/`, type: 'used' },
  ];

  // slug → { category, sale, rental, used }
  const forkliftMap = {};

  for (const section of sections) {
    let pageUrl = section.url;
    while (pageUrl) {
      const { results, nextPage } = await collectListingPage(pageUrl, section.type);
      for (const { slug, category } of results) {
        if (!forkliftMap[slug]) {
          forkliftMap[slug] = { category, sale: false, rental: false, used: false };
        }
        forkliftMap[slug][section.type] = true;
        if (category && !forkliftMap[slug].category) {
          forkliftMap[slug].category = category;
        }
      }
      pageUrl = nextPage;
    }
  }

  return forkliftMap;
}

// --- Scrape individual forklift page ---

async function scrapeForklift(slug, meta) {
  const url = `${BASE_URL}/carretillas/${slug}/`;
  const html = await fetchPage(url);

  const singleSection = extractSinglePageSection(html);

  // Name: first from single-page section heading, fallback to title
  let name = singleSection ? extractFirstHeading(singleSection) : '';
  if (!name || name.length > 60) {
    name = extractNameFromTitle(html);
  }

  // Description: first text-editor widget in the single-page section
  const textEditors = singleSection ? extractTextEditorContents(singleSection) : [];
  const description = textEditors[0] || '';
  const short_description = description.length > 160
    ? description.slice(0, description.lastIndexOf(' ', 160)) + '...'
    : description;

  // Images
  const images = singleSection ? extractImages(singleSection) : extractImages(html);
  const image_url = images[0] || '';

  // PDF catalog
  const catalog_pdf_url = singleSection ? extractPdfLink(singleSection) : '';

  // Specs from tables in single-page section
  const specs = singleSection ? extractSpecsFromTable(singleSection) : [];

  return {
    name,
    slug,
    category: meta.category || '',
    description,
    short_description,
    image_url,
    all_images: images,
    catalog_pdf_url,
    available_for_sale: meta.sale,
    available_for_rental: meta.rental,
    available_as_used: meta.used,
    is_published: true,
    source_url: url,
    specs,
  };
}

// --- Scrape static pages ---

async function scrapeStaticPage(url) {
  const html = await fetchPage(url);

  // Get single-page or body content, excluding nav/header/footer
  const singleSection = extractSinglePageSection(html);
  const content = singleSection || html;

  // Remove scripts, styles, forms, nav
  const cleaned = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '');

  return cleanText(cleaned);
}

// --- Brand assets ---

async function scrapeBrandAssets() {
  const html = await fetchPage(BASE_URL);

  // Logo URL found via DOM inspection
  const logoUrl = `${BASE_URL}/wp-content/uploads/Tecon_green_2_reverse-1-1024x909.png`;

  // Brand color extracted via Chrome DevTools DOM inspection: rgb(66, 255, 30)
  const brandGreenRgb = 'rgb(66, 255, 30)';
  const brandGreenHex = '#42FF1E';

  // Look for CSS custom property color definitions
  const colorVarMatches = html.match(/--e-global-color-[^:]+:\s*([^;}"]+)/g) || [];
  const cssVarColors = colorVarMatches.map(m => {
    const [varName, value] = m.split(':');
    return { var: varName.trim(), value: value.trim() };
  });

  return {
    logo_url: logoUrl,
    logo_filename: 'Tecon_green_2_reverse-1-1024x909.png',
    brand_green_rgb: brandGreenRgb,
    brand_green_hex: brandGreenHex,
    css_var_colors: cssVarColors.slice(0, 20),
    contact: {
      phone_landline: '96 170 51 13',
      phone_mobile: '638 946 040',
      address: 'S N, Camino Guardarany, 0, 46410 Sueca, Valencia',
      postal_code: '46410',
      city: 'Sueca',
      province: 'Valencia',
      email: 'info@carretillastekon.com',
      maps_url: 'https://www.google.com/maps?ll=39.211328,-0.30538&z=11&t=m&hl=es-ES&gl=US&mapclient=embed&cid=12967233320852956093',
      geo: { lat: 39.211328, lng: -0.30538 },
    },
  };
}

// --- Main ---

async function main() {
  console.log('=== Tekon WordPress Scraper ===\n');

  // 1. Brand assets
  console.log('--- Brand assets ---');
  const brand = await scrapeBrandAssets();
  writeFileSync(join(OUTPUT_DIR, 'brand.json'), JSON.stringify(brand, null, 2));
  console.log(`  Saved brand.json (green: ${brand.brand_green_hex})`);

  // 2. Collect forklift slugs + availability + categories from listing pages
  console.log('\n--- Collecting forklift metadata from listing pages ---');
  const forkliftMap = await collectAllForkliftData();
  const slugs = Object.keys(forkliftMap);
  console.log(`  Found ${slugs.length} unique forklifts`);

  // 3. Scrape each forklift detail page
  console.log('\n--- Scraping forklift detail pages ---');
  const forklifts = [];
  for (const slug of slugs) {
    try {
      const forklift = await scrapeForklift(slug, forkliftMap[slug]);
      forklifts.push(forklift);
      const flags = [
        forklift.available_for_sale ? 'sale' : null,
        forklift.available_for_rental ? 'rental' : null,
        forklift.available_as_used ? 'used' : null,
      ].filter(Boolean).join('/');
      console.log(`  ✓ ${forklift.name} | ${forklift.category} | ${flags} | ${forklift.specs.length} specs`);
    } catch (err) {
      console.error(`  ✗ ${slug}: ${err.message}`);
    }
  }
  writeFileSync(join(OUTPUT_DIR, 'forklifts.json'), JSON.stringify(forklifts, null, 2));
  console.log(`\n  Saved ${forklifts.length} forklifts to forklifts.json`);

  // 4. Categories
  const categoryNames = [...new Set(forklifts.map(f => f.category).filter(Boolean))];
  const categories = categoryNames.map((name, i) => ({
    name,
    slug: generateSlug(name),
    sort_order: i,
  }));
  writeFileSync(join(OUTPUT_DIR, 'categories.json'), JSON.stringify(categories, null, 2));
  console.log(`  Saved ${categories.length} categories: ${categories.map(c => c.name).join(', ')}`);

  // 5. Static pages
  console.log('\n--- Scraping static pages ---');
  const pages = [
    { key: 'about', url: `${BASE_URL}/sobre-nosotros/`, file: 'about.txt' },
    { key: 'solutions', url: `${BASE_URL}/nuestras-soluciones/`, file: 'solutions.txt' },
    { key: 'privacy', url: `${BASE_URL}/politica-de-privacidad/`, file: 'privacy.txt' },
    { key: 'cookies', url: `${BASE_URL}/politica-de-cookies/`, file: 'cookies.txt' },
    { key: 'legal', url: `${BASE_URL}/aviso-legal/`, file: 'legal-notice.txt' },
    { key: 'contact', url: `${BASE_URL}/contacto/`, file: 'contact.txt' },
  ];
  for (const page of pages) {
    try {
      const text = await scrapeStaticPage(page.url);
      writeFileSync(join(OUTPUT_DIR, page.file), text);
      console.log(`  ✓ ${page.key} (${text.length} chars)`);
    } catch (err) {
      console.error(`  ✗ ${page.url}: ${err.message}`);
    }
  }

  // 6. Summary
  const summary = {
    scraped_at: new Date().toISOString(),
    total_forklifts: forklifts.length,
    total_categories: categories.length,
    available_for_sale: forklifts.filter(f => f.available_for_sale).length,
    available_for_rental: forklifts.filter(f => f.available_for_rental).length,
    available_as_used: forklifts.filter(f => f.available_as_used).length,
    forklifts_with_description: forklifts.filter(f => f.description.length > 0).length,
    forklifts_with_image: forklifts.filter(f => f.image_url).length,
    forklifts_with_specs: forklifts.filter(f => f.specs.length > 0).length,
    forklifts_with_pdf: forklifts.filter(f => f.catalog_pdf_url).length,
    files: ['forklifts.json', 'brand.json', 'categories.json', 'about.txt', 'solutions.txt', 'privacy.txt', 'cookies.txt', 'legal-notice.txt', 'contact.txt', 'summary.json'],
  };
  writeFileSync(join(OUTPUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));

  console.log('\n=== Complete ===');
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

/**
 * Downloads all forklift PDFs from the legacy site and updates the DB URLs
 * to point to local /pdfs/ paths.
 *
 * Usage: node scripts/migrate-pdfs.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'pdfs');

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

mkdirSync(OUT_DIR, { recursive: true });

async function downloadPdf(url) {
  const filename = basename(url);
  const outPath = join(OUT_DIR, filename);

  if (existsSync(outPath)) {
    console.log(`  [skip] ${filename} already exists`);
    return `/pdfs/${filename}`;
  }

  console.log(`  [download] ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buf = await res.arrayBuffer();
  writeFileSync(outPath, Buffer.from(buf));
  console.log(`  [saved] ${filename} (${Math.round(buf.byteLength / 1024)} KB)`);
  return `/pdfs/${filename}`;
}

async function main() {
  const { data: forklifts, error } = await supabase
    .from('forklifts')
    .select('id, slug, catalog_pdf_url')
    .not('catalog_pdf_url', 'is', null);

  if (error) throw error;

  // Group by unique URL to avoid redundant downloads
  const urlMap = new Map(); // legacyUrl -> localPath

  for (const f of forklifts) {
    if (!urlMap.has(f.catalog_pdf_url)) {
      urlMap.set(f.catalog_pdf_url, null);
    }
  }

  console.log(`\nDownloading ${urlMap.size} unique PDFs…`);
  for (const [url] of urlMap) {
    const localPath = await downloadPdf(url);
    urlMap.set(url, localPath);
  }

  console.log('\nUpdating database…');
  for (const f of forklifts) {
    const localPath = urlMap.get(f.catalog_pdf_url);
    if (!localPath || localPath === f.catalog_pdf_url) continue;

    const { error: updateErr } = await supabase
      .from('forklifts')
      .update({ catalog_pdf_url: localPath })
      .eq('id', f.id);

    if (updateErr) {
      console.error(`  [error] ${f.slug}: ${updateErr.message}`);
    } else {
      console.log(`  [updated] ${f.slug} → ${localPath}`);
    }
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

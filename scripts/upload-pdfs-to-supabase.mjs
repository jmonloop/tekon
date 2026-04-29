/**
 * One-off migration: upload legacy /pdfs/*.pdf files to Supabase forklift-catalogs bucket
 * and update DB rows to point at the new public URLs.
 *
 * Usage:
 *   git --work-tree=/tmp/tekon-pdfs-restore checkout b69aa17^ -- public/pdfs/
 *   node scripts/upload-pdfs-to-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

const PDF_DIR = '/tmp/tekon-pdfs-restore/public/pdfs';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function uploadPdf(localPath, slug) {
  const key = `${slug}-catalog-${Date.now()}.pdf`;
  const buffer = readFileSync(localPath);

  const { error } = await supabase.storage
    .from('forklift-catalogs')
    .upload(key, buffer, { contentType: 'application/pdf', cacheControl: '3600', upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('forklift-catalogs')
    .getPublicUrl(key);

  return publicUrl;
}

async function main() {
  const { data: forklifts, error } = await supabase
    .from('forklifts')
    .select('id, slug, catalog_pdf_url')
    .like('catalog_pdf_url', '/pdfs/%');

  if (error) throw error;
  if (!forklifts.length) {
    console.log('No rows with /pdfs/ URLs found — nothing to migrate.');
    return;
  }

  console.log(`Found ${forklifts.length} forklift(s) with legacy /pdfs/ URLs.\n`);

  // Cache uploads by source filename so each PDF is uploaded once
  const uploadCache = new Map(); // basename -> publicUrl

  for (const f of forklifts) {
    const filename = basename(f.catalog_pdf_url);
    const localPath = join(PDF_DIR, filename);

    if (!existsSync(localPath)) {
      console.warn(`  [skip] ${f.slug}: local file not found at ${localPath}`);
      continue;
    }

    let publicUrl;
    if (uploadCache.has(filename)) {
      publicUrl = uploadCache.get(filename);
      console.log(`  [cached] ${f.slug}: reusing upload for ${filename}`);
    } else {
      console.log(`  [upload] ${f.slug}: ${filename}`);
      publicUrl = await uploadPdf(localPath, f.slug);
      uploadCache.set(filename, publicUrl);
      console.log(`  [uploaded] → ${publicUrl}`);
    }

    const { error: updateErr } = await supabase
      .from('forklifts')
      .update({ catalog_pdf_url: publicUrl })
      .eq('id', f.id);

    if (updateErr) {
      console.error(`  [error] ${f.slug}: ${updateErr.message}`);
    } else {
      console.log(`  [updated] ${f.slug}`);
    }
  }

  const { data: remaining } = await supabase
    .from('forklifts')
    .select('count', { count: 'exact', head: true })
    .like('catalog_pdf_url', '/pdfs/%');

  console.log(`\nDone. Rows still pointing at /pdfs/: ${remaining ?? 'unknown'}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

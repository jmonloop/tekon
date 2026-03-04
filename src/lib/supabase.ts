import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('Missing PUBLIC_SUPABASE_URL');
if (!supabaseAnonKey) throw new Error('Missing PUBLIC_SUPABASE_ANON_KEY');

/** Public client — uses anon key, safe to use in browser */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server client — uses service role key, bypasses RLS.
 * Only call this from server-side code (edge functions, SSR).
 */
export function createServerClient() {
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

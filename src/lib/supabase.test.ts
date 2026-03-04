import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ mock: 'client' })),
}));

const mockCreateClient = vi.mocked(createClient);

const TEST_URL = 'https://test-project.supabase.co';
const TEST_ANON_KEY = 'test-anon-key';
const TEST_SERVICE_ROLE_KEY = 'test-service-role-key';

describe('supabase module', () => {
  beforeEach(() => {
    vi.resetModules();
    mockCreateClient.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('public client', () => {
    it('creates client with PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY', async () => {
      vi.stubEnv('PUBLIC_SUPABASE_URL', TEST_URL);
      vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', TEST_ANON_KEY);

      const { supabase } = await import('./supabase');

      expect(mockCreateClient).toHaveBeenCalledWith(TEST_URL, TEST_ANON_KEY);
      expect(supabase).toBeDefined();
    });

    it('throws when PUBLIC_SUPABASE_URL is missing', async () => {
      vi.stubEnv('PUBLIC_SUPABASE_URL', '');
      vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', TEST_ANON_KEY);

      await expect(import('./supabase')).rejects.toThrow('Missing PUBLIC_SUPABASE_URL');
    });

    it('throws when PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
      vi.stubEnv('PUBLIC_SUPABASE_URL', TEST_URL);
      vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', '');

      await expect(import('./supabase')).rejects.toThrow('Missing PUBLIC_SUPABASE_ANON_KEY');
    });
  });

  describe('createServerClient', () => {
    it('creates client with service role key and no session persistence', async () => {
      vi.stubEnv('PUBLIC_SUPABASE_URL', TEST_URL);
      vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', TEST_ANON_KEY);
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', TEST_SERVICE_ROLE_KEY);

      const { createServerClient } = await import('./supabase');
      createServerClient();

      expect(mockCreateClient).toHaveBeenCalledWith(TEST_URL, TEST_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });
    });

    it('throws when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
      vi.stubEnv('PUBLIC_SUPABASE_URL', TEST_URL);
      vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', TEST_ANON_KEY);
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

      const { createServerClient } = await import('./supabase');

      expect(() => createServerClient()).toThrow('Missing SUPABASE_SERVICE_ROLE_KEY');
    });

    it('returns a client instance', async () => {
      vi.stubEnv('PUBLIC_SUPABASE_URL', TEST_URL);
      vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', TEST_ANON_KEY);
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', TEST_SERVICE_ROLE_KEY);

      const { createServerClient } = await import('./supabase');
      const client = createServerClient();

      expect(client).toBeDefined();
    });
  });
});

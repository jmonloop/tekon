import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const HOOK_URL = 'https://api.vercel.com/v1/integrations/deploy/test-hook';

describe('triggerDeploy', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('POSTs to the deploy hook URL and returns true on 200 response', async () => {
    vi.stubEnv('PUBLIC_VERCEL_DEPLOY_HOOK_URL', HOOK_URL);
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));

    const { triggerDeploy } = await import('./deploy');
    const result = await triggerDeploy();

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(HOOK_URL, { method: 'POST' });
  });

  it('returns false when the hook responds with a non-OK status', async () => {
    vi.stubEnv('PUBLIC_VERCEL_DEPLOY_HOOK_URL', HOOK_URL);
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }));

    const { triggerDeploy } = await import('./deploy');
    const result = await triggerDeploy();

    expect(result).toBe(false);
  });

  it('returns false when fetch throws a network error', async () => {
    vi.stubEnv('PUBLIC_VERCEL_DEPLOY_HOOK_URL', HOOK_URL);
    vi.mocked(fetch).mockRejectedValueOnce(new Error('network error'));

    const { triggerDeploy } = await import('./deploy');
    const result = await triggerDeploy();

    expect(result).toBe(false);
  });

  it('returns false and warns when hook URL is not configured', async () => {
    vi.stubEnv('PUBLIC_VERCEL_DEPLOY_HOOK_URL', '');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { triggerDeploy } = await import('./deploy');
    const result = await triggerDeploy();

    expect(result).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('PUBLIC_VERCEL_DEPLOY_HOOK_URL is not configured');
    warnSpy.mockRestore();
  });
});

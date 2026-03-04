/**
 * Triggers a Vercel deploy hook to rebuild the static site.
 * Returns true on success, false otherwise.
 */
export async function triggerDeploy(): Promise<boolean> {
  const hookUrl = import.meta.env.PUBLIC_VERCEL_DEPLOY_HOOK_URL as string | undefined;

  if (!hookUrl) {
    console.warn('PUBLIC_VERCEL_DEPLOY_HOOK_URL is not configured');
    return false;
  }

  try {
    const res = await fetch(hookUrl, { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

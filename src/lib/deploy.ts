/** Triggers the site build hook (Netlify/Vercel) to rebuild the static site. */
export async function triggerDeploy(): Promise<boolean> {
  const hookUrl = import.meta.env.PUBLIC_BUILD_HOOK_URL as string | undefined;

  if (!hookUrl) {
    console.warn('PUBLIC_BUILD_HOOK_URL is not configured');
    return false;
  }

  try {
    const res = await fetch(hookUrl, { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

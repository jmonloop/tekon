export const ADMIN_TITLE = 'Panel de Administración — Carretillas Tekon';
export const ADMIN_ROBOTS_META = 'noindex, nofollow';

export function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

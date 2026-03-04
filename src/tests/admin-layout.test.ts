import { describe, it, expect } from 'vitest';
import {
  ADMIN_TITLE,
  ADMIN_ROBOTS_META,
  isAdminPath,
} from '../layouts/admin-layout-data';

describe('AdminLayout data: meta', () => {
  it('robots meta is noindex, nofollow', () => {
    expect(ADMIN_ROBOTS_META).toBe('noindex, nofollow');
  });

  it('admin title is defined and non-empty', () => {
    expect(ADMIN_TITLE.trim().length).toBeGreaterThan(0);
  });
});

describe('AdminLayout data: isAdminPath', () => {
  it('returns true for /admin', () => {
    expect(isAdminPath('/admin')).toBe(true);
  });

  it('returns true for /admin/carretillas', () => {
    expect(isAdminPath('/admin/carretillas')).toBe(true);
  });

  it('returns true for /admin/categorias/nueva', () => {
    expect(isAdminPath('/admin/categorias/nueva')).toBe(true);
  });

  it('returns false for public routes', () => {
    expect(isAdminPath('/venta-de-carretillas')).toBe(false);
  });

  it('returns false for root', () => {
    expect(isAdminPath('/')).toBe(false);
  });
});

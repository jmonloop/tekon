import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminApp, { AdminRoutes } from '../components/islands/AdminApp';

/**
 * Task 11: Validate React Router SPA inside Astro catch-all route
 *
 * Tests verify that React Router BrowserRouter with basename="/admin" works:
 * - Correct view rendered for /admin, /admin/carretillas, /admin/categorias
 * - Browser back/forward navigation works between admin views
 * - Direct URL access to /admin/carretillas loads correct view
 *
 * AdminRoutes: renders routes, expects to be inside a Router (used in tests with MemoryRouter)
 * AdminApp: wraps AdminRoutes with BrowserRouter basename="/admin" (used in Astro island)
 */
describe('React Router SPA inside Astro catch-all route', () => {
  describe('Route rendering — correct view per URL', () => {
    it('renders dashboard view at /admin root', () => {
      render(
        <MemoryRouter initialEntries={['/']} basename="/">
          <AdminRoutes />
        </MemoryRouter>
      );
      expect(screen.getByTestId('admin-dashboard')).toBeDefined();
    });

    it('renders forklift list view at /carretillas', () => {
      render(
        <MemoryRouter initialEntries={['/carretillas']} basename="/">
          <AdminRoutes />
        </MemoryRouter>
      );
      expect(screen.getByTestId('admin-carretillas')).toBeDefined();
    });

    it('renders categories view at /categorias', () => {
      render(
        <MemoryRouter initialEntries={['/categorias']} basename="/">
          <AdminRoutes />
        </MemoryRouter>
      );
      expect(screen.getByTestId('admin-categorias')).toBeDefined();
    });
  });

  describe('Direct URL access — only correct view is shown', () => {
    it('shows forklift list and hides dashboard when accessing /carretillas directly', () => {
      render(
        <MemoryRouter initialEntries={['/carretillas']} basename="/">
          <AdminRoutes />
        </MemoryRouter>
      );
      expect(screen.getByTestId('admin-carretillas')).toBeDefined();
      expect(screen.queryByTestId('admin-dashboard')).toBeNull();
    });

    it('shows categories and hides dashboard when accessing /categorias directly', () => {
      render(
        <MemoryRouter initialEntries={['/categorias']} basename="/">
          <AdminRoutes />
        </MemoryRouter>
      );
      expect(screen.getByTestId('admin-categorias')).toBeDefined();
      expect(screen.queryByTestId('admin-dashboard')).toBeNull();
    });
  });

  describe('Browser back/forward navigation — history entries', () => {
    it('renders dashboard when history index points to root', () => {
      render(
        <MemoryRouter initialEntries={['/', '/carretillas']} initialIndex={0} basename="/">
          <AdminRoutes />
        </MemoryRouter>
      );
      expect(screen.getByTestId('admin-dashboard')).toBeDefined();
    });

    it('renders forklift list when history index points to /carretillas', () => {
      render(
        <MemoryRouter initialEntries={['/', '/carretillas']} initialIndex={1} basename="/">
          <AdminRoutes />
        </MemoryRouter>
      );
      expect(screen.getByTestId('admin-carretillas')).toBeDefined();
    });

    it('renders categories when history index points to /categorias', () => {
      render(
        <MemoryRouter
          initialEntries={['/', '/carretillas', '/categorias']}
          initialIndex={2}
          basename="/"
        >
          <AdminRoutes />
        </MemoryRouter>
      );
      expect(screen.getByTestId('admin-categorias')).toBeDefined();
    });
  });

  describe('AdminApp uses BrowserRouter with basename="/admin" internally', () => {
    it('renders admin-app-root without requiring an external router', () => {
      // AdminApp provides its own BrowserRouter with basename="/admin"
      // Push jsdom URL to /admin so BrowserRouter can match the basename
      window.history.pushState({}, '', '/admin');
      render(<AdminApp />);
      expect(screen.getByTestId('admin-app-root')).toBeDefined();
      // Restore location
      window.history.pushState({}, '', '/');
    });
  });
});

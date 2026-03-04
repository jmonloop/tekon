import { BrowserRouter, Routes, Route } from 'react-router-dom';

function DashboardView() {
  return (
    <div data-testid="admin-dashboard" className="p-8">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      <p className="text-muted-foreground">Bienvenido al panel de administración de Tekon.</p>
    </div>
  );
}

function ForkliftListView() {
  return (
    <div data-testid="admin-carretillas" className="p-8">
      <h1 className="text-2xl font-bold mb-4">Carretillas</h1>
      <p className="text-muted-foreground">Gestión de carretillas elevadoras.</p>
    </div>
  );
}

function CategoriesView() {
  return (
    <div data-testid="admin-categorias" className="p-8">
      <h1 className="text-2xl font-bold mb-4">Categorías</h1>
      <p className="text-muted-foreground">Gestión de categorías.</p>
    </div>
  );
}

/** Routes only — expects to be rendered inside a Router (BrowserRouter or MemoryRouter) */
export function AdminRoutes() {
  return (
    <div data-testid="admin-app-root" id="admin-app" className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/carretillas" element={<ForkliftListView />} />
        <Route path="/categorias" element={<CategoriesView />} />
      </Routes>
    </div>
  );
}

/** Full SPA shell — wraps AdminRoutes with BrowserRouter basename="/admin" for Astro island */
export default function AdminApp() {
  return (
    <BrowserRouter basename="/admin">
      <AdminRoutes />
    </BrowserRouter>
  );
}

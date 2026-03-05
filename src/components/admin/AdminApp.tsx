import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AuthProvider } from './AuthProvider';
import { AuthGuard } from './AuthGuard';
import { AdminSidebar } from './AdminSidebar';
import { Dashboard } from './Dashboard';
import { ForkliftList } from './ForkliftList';
import { ForkliftForm } from './ForkliftForm';
import { CategoryList } from './CategoryList';
import { InquiriesTable } from './InquiriesTable';

/** Routes only — expects to be inside a Router (used in tests with MemoryRouter) */
export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/carretillas" element={<ForkliftList />} />
      <Route path="/carretillas/nueva" element={<ForkliftForm />} />
      <Route path="/carretillas/:id" element={<ForkliftForm />} />
      <Route path="/categorias" element={<CategoryList />} />
      <Route path="/consultas" element={<InquiriesTable />} />
    </Routes>
  );
}

/** Shell: sidebar + main routes, expects to be inside Router + AuthProvider */
export function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div data-testid="admin-shell" className="flex min-h-screen bg-background">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b md:hidden">
          <button
            aria-label="Abrir menú"
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-semibold text-sm">Tekon Admin</span>
        </header>
        <main className="flex-1 overflow-auto">
          <AdminRoutes />
        </main>
      </div>
    </div>
  );
}

/** Full SPA — BrowserRouter > AuthProvider > AuthGuard > AdminShell */
export default function AdminApp() {
  return (
    <BrowserRouter basename="/admin">
      <AuthProvider>
        <AuthGuard>
          <AdminShell />
        </AuthGuard>
      </AuthProvider>
    </BrowserRouter>
  );
}

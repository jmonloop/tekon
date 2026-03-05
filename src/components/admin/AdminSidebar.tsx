import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, FolderOpen, MessageSquare } from 'lucide-react';
import { useAuth } from './AuthProvider';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Carretillas', path: '/carretillas', icon: Truck },
  { label: 'Categorías', path: '/categorias', icon: FolderOpen },
  { label: 'Consultas', path: '/consultas', icon: MessageSquare },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { pathname } = useLocation();
  const { signOut } = useAuth();

  function isActive(path: string) {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        data-testid="admin-sidebar"
        className={[
          'fixed inset-y-0 left-0 z-40 w-60 bg-background border-r flex flex-col transition-transform duration-200',
          'md:static md:z-auto md:translate-x-0 md:min-h-screen',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="px-6 py-5 border-b">
          <span className="font-semibold text-lg">Tekon Admin</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1" aria-label="Menú principal">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              data-testid={`sidebar-link-${label.toLowerCase()}`}
              aria-current={isActive(path) ? 'page' : undefined}
              onClick={onClose}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive(path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t">
          <button
            data-testid="sidebar-signout"
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

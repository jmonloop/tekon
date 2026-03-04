import { useAuth } from './AuthProvider';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="auth-loading">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    window.location.href = '/admin/login';
    return null;
  }

  return <>{children}</>;
}

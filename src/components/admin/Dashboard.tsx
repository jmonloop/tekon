import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { triggerDeploy } from '@/lib/deploy';

interface DashboardStats {
  totalForklifts: number;
  publishedForklifts: number;
  unreadInquiries: number;
}

function StatCard({
  title,
  value,
  description,
  loading,
  onClick,
  testId,
}: {
  title: string;
  value: number | null;
  description?: string;
  loading: boolean;
  onClick?: () => void;
  testId?: string;
}) {
  return (
    <Card
      data-testid={testId}
      className={onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton data-testid="stat-skeleton" className="h-9 w-16" />
        ) : (
          <p data-testid={testId ? `${testId}-value` : undefined} className="text-3xl font-bold">
            {value ?? '—'}
          </p>
        )}
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleRebuild() {
    setDeployStatus('loading');
    const ok = await triggerDeploy();
    setDeployStatus(ok ? 'success' : 'error');
    setTimeout(() => setDeployStatus('idle'), 4000);
  }

  useEffect(() => {
    async function fetchStats() {
      try {
        const [totalRes, publishedRes, unreadRes] = await Promise.all([
          supabase.from('forklifts').select('*', { count: 'exact', head: true }),
          supabase.from('forklifts').select('*', { count: 'exact', head: true }).eq('is_published', true),
          supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('read', false),
        ]);

        if (totalRes.error) throw totalRes.error;
        if (publishedRes.error) throw publishedRes.error;
        if (unreadRes.error) throw unreadRes.error;

        setStats({
          totalForklifts: totalRes.count ?? 0,
          publishedForklifts: publishedRes.count ?? 0,
          unreadInquiries: unreadRes.count ?? 0,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message :
          typeof err === 'object' && err !== null && 'message' in err ? String((err as { message: unknown }).message) :
          'Error al cargar el dashboard';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div data-testid="admin-dashboard" className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Bienvenido al panel de administración de Tekon.</p>
      </div>

      {error && (
        <div
          data-testid="dashboard-error"
          className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          testId="stat-total-forklifts"
          title="Total carretillas"
          value={stats?.totalForklifts ?? null}
          loading={loading}
          onClick={() => navigate('/carretillas')}
        />
        <StatCard
          testId="stat-published-forklifts"
          title="Carretillas publicadas"
          value={stats?.publishedForklifts ?? null}
          loading={loading}
          onClick={() => navigate('/carretillas')}
        />
        <StatCard
          testId="stat-unread-inquiries"
          title="Consultas sin leer"
          value={stats?.unreadInquiries ?? null}
          loading={loading}
          onClick={() => navigate('/consultas')}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            data-testid="quick-link-nueva-carretilla"
            onClick={() => navigate('/carretillas/nueva')}
          >
            + Nueva carretilla
          </Button>
          <Button
            data-testid="quick-link-consultas"
            variant="outline"
            onClick={() => navigate('/consultas')}
          >
            Ver consultas
          </Button>
          <Button
            data-testid="rebuild-site-btn"
            variant="outline"
            disabled={deployStatus === 'loading'}
            onClick={handleRebuild}
          >
            {deployStatus === 'loading' ? 'Reconstruyendo…' : 'Reconstruir sitio'}
          </Button>
        </div>
        {deployStatus === 'success' && (
          <p data-testid="rebuild-success" className="text-sm text-green-600">
            Reconstrucción iniciada correctamente.
          </p>
        )}
        {deployStatus === 'error' && (
          <p data-testid="rebuild-error" className="text-sm text-destructive">
            Error al iniciar la reconstrucción.
          </p>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useOptimistic, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'radix-ui';
import { Plus, Trash2, Pencil, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { Forklift, Category } from '@/lib/types';

export function ForkliftList() {
  const navigate = useNavigate();
  const [forklifts, setForklifts] = useState<Forklift[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Forklift | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [optimisticForklifts, setOptimisticPublish] = useOptimistic(
    forklifts,
    (state, { id, is_published }: { id: string; is_published: boolean }) =>
      state.map((f) => (f.id === id ? { ...f, is_published } : f)),
  );

  const fetchData = async () => {
    const [forkliftRes, categoryRes] = await Promise.all([
      supabase
        .from('forklifts')
        .select('*, category:categories(id, name, slug, sort_order, created_at)')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    ]);

    if (forkliftRes.error) {
      setError(forkliftRes.error.message);
    } else {
      setForklifts(forkliftRes.data ?? []);
    }

    if (categoryRes.error) {
      setError((prev) => prev ?? categoryRes.error!.message);
    } else {
      setCategories(categoryRes.data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePublish = (forklift: Forklift) => {
    const newValue = !forklift.is_published;
    startTransition(async () => {
      setOptimisticPublish({ id: forklift.id, is_published: newValue });
      const { error: updateError } = await supabase
        .from('forklifts')
        .update({ is_published: newValue })
        .eq('id', forklift.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        setForklifts((prev) =>
          prev.map((f) => (f.id === forklift.id ? { ...f, is_published: newValue } : f)),
        );
      }
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    const { error: deleteErr } = await supabase
      .from('forklifts')
      .delete()
      .eq('id', deleteTarget.id);

    if (deleteErr) {
      setDeleteError(deleteErr.message);
      return;
    }

    setDeleteTarget(null);
    setDeleteError(null);
    await fetchData();
  };

  const filtered = optimisticForklifts.filter((f) => {
    const matchesSearch =
      !search || f.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !categoryFilter || f.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div data-testid="admin-carretillas" className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Carretillas</h1>
        <Button
          data-testid="nueva-carretilla-btn"
          onClick={() => navigate('/carretillas/nueva')}
        >
          <Plus className="size-4" />
          Nueva carretilla
        </Button>
      </div>

      {error && (
        <div
          data-testid="forklift-list-error"
          className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
          <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
            Cerrar
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          data-testid="search-input"
          placeholder="Buscar carretillas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          data-testid="category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y" data-testid="forklifts-loading">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="size-12 rounded bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="h-6 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-8 w-16 rounded bg-muted animate-pulse" />
                  <div className="h-8 w-16 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div data-testid="forklifts-list">
              {filtered.length === 0 ? (
                <div
                  data-testid="forklifts-empty"
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No hay carretillas.{' '}
                  {search || categoryFilter
                    ? 'Prueba con otros filtros.'
                    : 'Crea la primera.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Imagen</th>
                      <th className="px-4 py-3 text-left font-medium">Nombre</th>
                      <th className="px-4 py-3 text-left font-medium">Categoría</th>
                      <th className="px-4 py-3 text-left font-medium">Estado</th>
                      <th className="px-4 py-3 text-right font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((forklift) => (
                      <tr
                        key={forklift.id}
                        data-testid={`forklift-row-${forklift.id}`}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          {forklift.image_url ? (
                            <img
                              data-testid={`forklift-image-${forklift.id}`}
                              src={forklift.image_url}
                              alt={forklift.name}
                              className="size-12 rounded object-cover"
                            />
                          ) : (
                            <div
                              data-testid={`forklift-no-image-${forklift.id}`}
                              className="size-12 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs"
                            >
                              Sin imagen
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            data-testid={`forklift-name-${forklift.id}`}
                            className="font-medium"
                          >
                            {forklift.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            data-testid={`forklift-category-${forklift.id}`}
                            className="text-muted-foreground"
                          >
                            {forklift.category?.name ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            data-testid={`forklift-status-${forklift.id}`}
                            className={
                              forklift.is_published
                                ? 'inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800'
                                : 'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                            }
                          >
                            {forklift.is_published ? 'Publicado' : 'Borrador'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              data-testid={`toggle-publish-${forklift.id}`}
                              onClick={() => handleTogglePublish(forklift)}
                              title={forklift.is_published ? 'Despublicar' : 'Publicar'}
                            >
                              {forklift.is_published ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              data-testid={`edit-forklift-${forklift.id}`}
                              onClick={() => navigate(`/carretillas/${forklift.id}`)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              data-testid={`delete-forklift-${forklift.id}`}
                              onClick={() => {
                                setDeleteTarget(forklift);
                                setDeleteError(null);
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog.Root
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content
            data-testid="delete-dialog"
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-lg"
          >
            <Dialog.Title className="text-lg font-semibold">
              Eliminar carretilla
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              ¿Estás seguro de que quieres eliminar &quot;{deleteTarget?.name}&quot;? Esta
              acción no se puede deshacer.
            </Dialog.Description>
            {deleteError && (
              <div
                data-testid="delete-error"
                className="mt-3 rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {deleteError}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline" data-testid="delete-cancel">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button
                variant="destructive"
                data-testid="delete-confirm"
                onClick={handleDeleteConfirm}
              >
                Eliminar
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

import { useState, useEffect, useTransition, useRef } from 'react';
import { Dialog } from 'radix-ui';
import { GripVertical, Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemId = useRef<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchCategories = async () => {
    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setCategories(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSave = async (id: string) => {
    if (!editingName.trim()) return;
    const slug = generateSlug(editingName.trim());
    const { error: updateError } = await supabase
      .from('categories')
      .update({ name: editingName.trim(), slug })
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setEditingId(null);
    setEditingName('');
    await fetchCategories();
  };

  const handleAddNew = async () => {
    if (!newName.trim()) return;
    const slug = generateSlug(newName.trim());
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.sort_order), -1);
    const { error: insertError } = await supabase
      .from('categories')
      .insert({ name: newName.trim(), slug, sort_order: maxOrder + 1 });

    if (insertError) {
      setError(insertError.message);
      return;
    }
    setIsAddingNew(false);
    setNewName('');
    await fetchCategories();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    const { count } = await supabase
      .from('forklifts')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', deleteTarget.id);

    if (count && count > 0) {
      setDeleteError(`No se puede eliminar. Hay ${count} carretilla(s) en esta categoría.`);
      return;
    }

    const { error: deleteErr } = await supabase
      .from('categories')
      .delete()
      .eq('id', deleteTarget.id);

    if (deleteErr) {
      setDeleteError(deleteErr.message);
      return;
    }

    setDeleteTarget(null);
    setDeleteError(null);
    await fetchCategories();
  };

  const handleDragStart = (id: string) => {
    dragItemId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = dragItemId.current;
    if (!sourceId || sourceId === targetId) {
      setDragOverId(null);
      return;
    }

    const sourceIndex = categories.findIndex((c) => c.id === sourceId);
    const targetIndex = categories.findIndex((c) => c.id === targetId);
    const reordered = [...categories];
    const [removed] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, removed);
    const updated = reordered.map((cat, i) => ({ ...cat, sort_order: i }));

    setCategories(updated);
    setDragOverId(null);
    dragItemId.current = null;

    startTransition(async () => {
      for (const cat of updated) {
        await supabase
          .from('categories')
          .update({ sort_order: cat.sort_order })
          .eq('id', cat.id);
      }
    });
  };

  const handleDragEnd = () => {
    setDragOverId(null);
    dragItemId.current = null;
  };

  return (
    <div data-testid="admin-categorias" className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button
          data-testid="add-category-btn"
          onClick={() => { setIsAddingNew(true); setNewName(''); }}
          disabled={isAddingNew}
        >
          <Plus className="size-4" />
          Nueva categoría
        </Button>
      </div>

      {error && (
        <div
          data-testid="category-error"
          className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
          <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
            Cerrar
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y" data-testid="categories-loading">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                  <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
                  <div className="h-8 w-16 rounded bg-muted animate-pulse" />
                  <div className="h-8 w-16 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y" data-testid="categories-list">
              {categories.length === 0 && !isAddingNew && (
                <div
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                  data-testid="categories-empty"
                >
                  No hay categorías. Crea la primera.
                </div>
              )}

              {categories.map((category) => (
                <div
                  key={category.id}
                  data-testid={`category-row-${category.id}`}
                  draggable
                  onDragStart={() => handleDragStart(category.id)}
                  onDragOver={(e) => handleDragOver(e, category.id)}
                  onDrop={(e) => handleDrop(e, category.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition-colors',
                    dragOverId === category.id && 'bg-accent',
                  )}
                >
                  <GripVertical
                    className="size-4 text-muted-foreground cursor-grab shrink-0"
                    data-testid="drag-handle"
                  />
                  {editingId === category.id ? (
                    <>
                      <Input
                        data-testid={`category-name-input-${category.id}`}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(category.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        data-testid={`save-category-${category.id}`}
                        onClick={() => handleSave(category.id)}
                        disabled={!editingName.trim()}
                      >
                        <Check className="size-4" />
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-testid={`cancel-category-${category.id}`}
                        onClick={handleCancelEdit}
                      >
                        <X className="size-4" />
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <span
                        className="flex-1 text-sm"
                        data-testid={`category-name-${category.id}`}
                      >
                        {category.name}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`edit-category-${category.id}`}
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="size-4" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        data-testid={`delete-category-${category.id}`}
                        onClick={() => { setDeleteTarget(category); setDeleteError(null); }}
                      >
                        <Trash2 className="size-4" />
                        Eliminar
                      </Button>
                    </>
                  )}
                </div>
              ))}

              {isAddingNew && (
                <div className="flex items-center gap-3 px-4 py-3" data-testid="new-category-row">
                  <GripVertical className="size-4 text-muted-foreground shrink-0 opacity-30" />
                  <Input
                    data-testid="new-category-name-input"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddNew();
                      if (e.key === 'Escape') { setIsAddingNew(false); setNewName(''); }
                    }}
                    placeholder="Nombre de la categoría"
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    data-testid="save-new-category"
                    onClick={handleAddNew}
                    disabled={!newName.trim()}
                  >
                    <Check className="size-4" />
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-testid="cancel-new-category"
                    onClick={() => { setIsAddingNew(false); setNewName(''); }}
                  >
                    <X className="size-4" />
                    Cancelar
                  </Button>
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
              Eliminar categoría
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              ¿Estás seguro de que quieres eliminar la categoría &quot;{deleteTarget?.name}&quot;? Esta acción no se puede deshacer.
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

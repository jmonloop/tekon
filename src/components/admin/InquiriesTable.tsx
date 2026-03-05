import { useState, useEffect, useOptimistic, useTransition } from 'react';
import { Link } from 'react-router-dom';
import { Dialog } from 'radix-ui';
import { Trash2, Mail, MailOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Inquiry } from '@/lib/types';

type FilterTab = 'all' | 'unread' | 'read';

export function InquiriesTable() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [optimisticInquiries, setOptimisticRead] = useOptimistic(
    inquiries,
    (state, { id, read }: { id: string; read: boolean }) =>
      state.map((inq) => (inq.id === id ? { ...inq, read } : inq)),
  );

  const fetchInquiries = async () => {
    const { data, error: fetchError } = await supabase
      .from('inquiries')
      .select('*, forklift:forklifts(id, name, slug)')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setInquiries(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleToggleRead = (inquiry: Inquiry) => {
    const newValue = !inquiry.read;
    startTransition(async () => {
      setOptimisticRead({ id: inquiry.id, read: newValue });
      const { error: updateError } = await supabase
        .from('inquiries')
        .update({ read: newValue })
        .eq('id', inquiry.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === inquiry.id ? { ...inq, read: newValue } : inq)),
        );
      }
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    const { error: deleteErr } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', deleteTarget.id);

    if (deleteErr) {
      setDeleteError(deleteErr.message);
      return;
    }

    setDeleteTarget(null);
    setDeleteError(null);
    await fetchInquiries();
  };

  const filtered = optimisticInquiries.filter((inq) => {
    if (activeTab === 'unread') return !inq.read;
    if (activeTab === 'read') return inq.read;
    return true;
  });

  const unreadCount = optimisticInquiries.filter((inq) => !inq.read).length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div data-testid="admin-consultas" className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold">Consultas</h1>

      {error && (
        <div
          data-testid="inquiries-error"
          className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
          <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
            Cerrar
          </Button>
        </div>
      )}

      {/* Filter tabs */}
      <div data-testid="filter-tabs" className="flex gap-1 border-b">
        {(['all', 'unread', 'read'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            data-testid={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'all' && 'Todas'}
            {tab === 'unread' && (
              <span className="flex items-center gap-1.5">
                Sin leer
                {unreadCount > 0 && (
                  <span
                    data-testid="unread-count-badge"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground min-w-[1.25rem]"
                  >
                    {unreadCount}
                  </span>
                )}
              </span>
            )}
            {tab === 'read' && 'Leídas'}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y" data-testid="inquiries-loading">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-8 w-20 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div data-testid="inquiries-list">
              {filtered.length === 0 ? (
                <div
                  data-testid="inquiries-empty"
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No hay consultas.
                </div>
              ) : (
                <div className="divide-y">
                  {filtered.map((inq) => (
                    <div
                      key={inq.id}
                      data-testid={`inquiry-row-${inq.id}`}
                      className={`transition-colors ${!inq.read ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
                    >
                      {/* Row header */}
                      <div
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30"
                        onClick={() =>
                          setExpandedId((prev) => (prev === inq.id ? null : inq.id))
                        }
                      >
                        <button
                          data-testid={`expand-btn-${inq.id}`}
                          className="shrink-0 text-muted-foreground"
                          aria-label={expandedId === inq.id ? 'Colapsar' : 'Expandir'}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId((prev) => (prev === inq.id ? null : inq.id));
                          }}
                        >
                          {expandedId === inq.id ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </button>

                        {!inq.read && (
                          <span
                            data-testid={`unread-badge-${inq.id}`}
                            className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground"
                          >
                            Nueva
                          </span>
                        )}

                        <div className="flex-1 min-w-0">
                          <span
                            data-testid={`inquiry-name-${inq.id}`}
                            className={`text-sm ${!inq.read ? 'font-semibold' : 'font-medium'}`}
                          >
                            {inq.name}
                          </span>
                          <span className="mx-2 text-muted-foreground">·</span>
                          <span
                            data-testid={`inquiry-email-${inq.id}`}
                            className="text-sm text-muted-foreground"
                          >
                            {inq.email}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          {inq.forklift ? (
                            <Link
                              data-testid={`inquiry-forklift-link-${inq.id}`}
                              to={`/carretillas/${inq.forklift.id}`}
                              className="text-sm text-primary underline-offset-4 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {inq.forklift.name}
                            </Link>
                          ) : (
                            <span
                              data-testid={`inquiry-no-forklift-${inq.id}`}
                              className="text-sm text-muted-foreground"
                            >
                              —
                            </span>
                          )}

                          <span
                            data-testid={`inquiry-date-${inq.id}`}
                            className="hidden sm:inline text-sm text-muted-foreground"
                          >
                            {formatDate(inq.created_at)}
                          </span>

                          <Button
                            size="sm"
                            variant="outline"
                            data-testid={`toggle-read-${inq.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleRead(inq);
                            }}
                            title={inq.read ? 'Marcar como no leído' : 'Marcar como leído'}
                          >
                            {inq.read ? (
                              <Mail className="size-4" />
                            ) : (
                              <MailOpen className="size-4" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            data-testid={`delete-inquiry-${inq.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(inq);
                              setDeleteError(null);
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded message */}
                      {expandedId === inq.id && (
                        <div
                          data-testid={`inquiry-message-${inq.id}`}
                          className="px-12 pb-4 text-sm text-foreground"
                        >
                          <p className="whitespace-pre-wrap">{inq.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
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
            <Dialog.Title className="text-lg font-semibold">Eliminar consulta</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              ¿Estás seguro de que quieres eliminar la consulta de &quot;
              {deleteTarget?.name}&quot;? Esta acción no se puede deshacer.
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

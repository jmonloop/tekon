import { useState, useRef } from 'react';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SpecRow {
  id: string;
  spec_name: string;
  spec_value: string;
  spec_unit: string;
  sort_order: number;
  isNew?: boolean;
  isDeleted?: boolean;
}

interface SpecsEditorProps {
  specRows: SpecRow[];
  specNameSuggestions: string[];
  onChange: (rows: SpecRow[]) => void;
}

export function SpecsEditor({ specRows, specNameSuggestions, onChange }: SpecsEditorProps) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemId = useRef<string | null>(null);

  const visibleRows = specRows.filter((r) => !r.isDeleted);

  const addRow = () => {
    const newRow: SpecRow = {
      id: crypto.randomUUID(),
      spec_name: '',
      spec_value: '',
      spec_unit: '',
      sort_order: visibleRows.length,
      isNew: true,
    };
    onChange([...specRows, newRow]);
  };

  const deleteRow = (id: string) => {
    onChange(specRows.map((row) => (row.id === id ? { ...row, isDeleted: true } : row)));
  };

  const updateRow = (
    id: string,
    field: 'spec_name' | 'spec_value' | 'spec_unit',
    value: string,
  ) => {
    onChange(specRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleDragStart = (id: string) => {
    dragItemId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = dragItemId.current;
    if (!sourceId || sourceId === targetId) {
      setDragOverId(null);
      return;
    }

    const visible = specRows.filter((r) => !r.isDeleted);
    const sourceIndex = visible.findIndex((r) => r.id === sourceId);
    const targetIndex = visible.findIndex((r) => r.id === targetId);
    const reordered = [...visible];
    const [removed] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, removed);
    const updatedVisible = reordered.map((row, i) => ({ ...row, sort_order: i }));

    const deletedRows = specRows.filter((r) => r.isDeleted);
    onChange([...updatedVisible, ...deletedRows]);

    setDragOverId(null);
    dragItemId.current = null;
  };

  const handleDragEnd = () => {
    setDragOverId(null);
    dragItemId.current = null;
  };

  return (
    <div data-testid="specs-editor" className="space-y-4">
      <h2 className="text-lg font-semibold">Especificaciones técnicas</h2>

      <datalist id="spec-name-suggestions">
        {specNameSuggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {visibleRows.length > 0 ? (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-8 px-2 py-2" />
                <th className="px-3 py-2 text-left font-medium">Nombre</th>
                <th className="px-3 py-2 text-left font-medium">Valor</th>
                <th className="px-3 py-2 text-left font-medium">Unidad</th>
                <th className="w-10 px-2 py-2" />
              </tr>
            </thead>
            <tbody data-testid="specs-rows">
              {visibleRows.map((row) => (
                <tr
                  key={row.id}
                  data-testid={`spec-row-${row.id}`}
                  draggable
                  onDragStart={() => handleDragStart(row.id)}
                  onDragOver={(e) => handleDragOver(e, row.id)}
                  onDrop={(e) => handleDrop(e, row.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'border-b last:border-0 transition-colors',
                    dragOverId === row.id && 'bg-accent',
                  )}
                >
                  <td className="px-2 py-1">
                    <GripVertical
                      className="size-4 cursor-grab text-muted-foreground"
                      data-testid={`spec-drag-handle-${row.id}`}
                    />
                  </td>
                  <td className="px-3 py-1">
                    <Input
                      data-testid={`spec-name-${row.id}`}
                      value={row.spec_name}
                      onChange={(e) => updateRow(row.id, 'spec_name', e.target.value)}
                      placeholder="Ej: Capacidad"
                      list="spec-name-suggestions"
                      className={cn(
                        'h-8 text-sm',
                        !row.spec_name.trim() && row.spec_value.trim() && 'border-destructive',
                      )}
                    />
                  </td>
                  <td className="px-3 py-1">
                    <Input
                      data-testid={`spec-value-${row.id}`}
                      value={row.spec_value}
                      onChange={(e) => updateRow(row.id, 'spec_value', e.target.value)}
                      placeholder="Ej: 1000"
                      className={cn(
                        'h-8 text-sm',
                        !row.spec_value.trim() && row.spec_name.trim() && 'border-destructive',
                      )}
                    />
                  </td>
                  <td className="px-3 py-1">
                    <Input
                      data-testid={`spec-unit-${row.id}`}
                      value={row.spec_unit}
                      onChange={(e) => updateRow(row.id, 'spec_unit', e.target.value)}
                      placeholder="Ej: kg"
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      data-testid={`spec-delete-${row.id}`}
                      onClick={() => deleteRow(row.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          data-testid="specs-empty"
          className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground"
        >
          No hay especificaciones. Añade la primera.
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        data-testid="add-spec-btn"
        onClick={addRow}
        disabled={visibleRows.length >= 50}
        className="w-full"
      >
        <Plus className="size-4" />
        Añadir especificación
      </Button>
    </div>
  );
}

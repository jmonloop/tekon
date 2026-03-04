import { useState, useEffect, useTransition, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { SpecsEditor, type SpecRow } from './SpecsEditor';

interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

interface FormData {
  name: string;
  slug: string;
  category_id: string;
  short_description: string;
  description: string;
  available_for_sale: boolean;
  available_for_rental: boolean;
  available_as_used: boolean;
  is_published: boolean;
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

async function saveSpecs(forkliftId: string, rows: SpecRow[]) {
  const deletedIds = rows.filter((r) => r.isDeleted && !r.isNew).map((r) => r.id);

  if (deletedIds.length > 0) {
    const { error } = await supabase.from('forklift_specs').delete().in('id', deletedIds);
    if (error) throw error;
  }

  const activeRows = rows
    .filter((r) => !r.isDeleted && (r.spec_name.trim() || r.spec_value.trim()))
    .map((row, index) => ({
      ...(row.isNew ? {} : { id: row.id }),
      forklift_id: forkliftId,
      spec_name: row.spec_name,
      spec_value: row.spec_value,
      spec_unit: row.spec_unit || null,
      sort_order: index,
    }));

  if (activeRows.length > 0) {
    const { error } = await supabase
      .from('forklift_specs')
      .upsert(activeRows, { onConflict: 'id' });
    if (error) throw error;
  }
}

export function ForkliftForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    category_id: '',
    short_description: '',
    description: '',
    available_for_sale: false,
    available_for_rental: false,
    available_as_used: false,
    is_published: false,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imageDragOver, setImageDragOver] = useState(false);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [specNameSuggestions, setSpecNameSuggestions] = useState<string[]>([]);
  const [specRows, setSpecRows] = useState<SpecRow[]>([]);

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories and existing spec name suggestions
  useEffect(() => {
    const fetchInitial = async () => {
      const [catsResult, specsResult] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('forklift_specs').select('spec_name'),
      ]);

      if (catsResult.error) {
        setError(catsResult.error.message);
      } else {
        setCategories(catsResult.data ?? []);
      }

      if (!specsResult.error && specsResult.data) {
        const unique = [...new Set(specsResult.data.map((s: { spec_name: string }) => s.spec_name))];
        setSpecNameSuggestions(unique);
      }
    };

    fetchInitial();
  }, []);

  // Fetch existing forklift data in edit mode
  useEffect(() => {
    if (!isEditMode || !id) return;

    const fetchForklift = async () => {
      setLoading(true);
      try {
      const [forkliftResult, specsResult] = await Promise.all([
        supabase.from('forklifts').select('*').eq('id', id).single(),
        supabase
          .from('forklift_specs')
          .select('*')
          .eq('forklift_id', id)
          .order('sort_order', { ascending: true }),
      ]);

      if (forkliftResult.error) {
        setError(forkliftResult.error.message);
        setLoading(false);
        return;
      }

      const forklift = forkliftResult.data;
      setFormData({
        name: forklift.name,
        slug: forklift.slug,
        category_id: forklift.category_id,
        short_description: forklift.short_description ?? '',
        description: forklift.description ?? '',
        available_for_sale: forklift.available_for_sale,
        available_for_rental: forklift.available_for_rental,
        available_as_used: forklift.available_as_used,
        is_published: forklift.is_published,
      });
      setSlugManuallyEdited(true);
      setExistingImageUrl(forklift.image_url ?? null);
      setImagePreviewUrl(forklift.image_url ?? null);
      setExistingPdfUrl(forklift.catalog_pdf_url ?? null);
      if (forklift.catalog_pdf_url) {
        const parts = forklift.catalog_pdf_url.split('/');
        setPdfFileName(parts[parts.length - 1]);
      }

      if (!specsResult.error && specsResult.data) {
        setSpecRows(
          specsResult.data.map(
            (spec: {
              id: string;
              spec_name: string;
              spec_value: string;
              spec_unit: string | null;
              sort_order: number;
            }) => ({
              id: spec.id,
              spec_name: spec.spec_name,
              spec_value: spec.spec_value,
              spec_unit: spec.spec_unit ?? '',
              sort_order: spec.sort_order,
            }),
          ),
        );
      }

      setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la carretilla');
        setLoading(false);
      }
    };

    fetchForklift();
  }, [id, isEditMode]);

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: slugManuallyEdited ? prev.slug : generateSlug(name),
    }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5MB');
      return;
    }
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handlePdfFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('El PDF no puede superar 10MB');
      return;
    }
    setPdfFile(file);
    setPdfFileName(file.name);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      setError(null);
      try {
        if (!formData.name.trim()) throw new Error('El nombre es obligatorio');
        if (!formData.slug.trim()) throw new Error('El slug es obligatorio');
        if (!formData.category_id) throw new Error('La categoría es obligatoria');

        let imageUrl: string | null = existingImageUrl;
        if (imageFile) {
          const ext = imageFile.name.split('.').pop();
          const fileName = `${formData.slug}-${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from('forklift-images')
            .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });
          if (uploadError) throw uploadError;
          const {
            data: { publicUrl },
          } = supabase.storage.from('forklift-images').getPublicUrl(fileName);
          imageUrl = publicUrl;
        }

        let pdfUrl: string | null = existingPdfUrl;
        if (pdfFile) {
          const fileName = `${formData.slug}-catalog-${Date.now()}.pdf`;
          const { error: uploadError } = await supabase.storage
            .from('forklift-catalogs')
            .upload(fileName, pdfFile, { cacheControl: '3600', upsert: false });
          if (uploadError) throw uploadError;
          const {
            data: { publicUrl },
          } = supabase.storage.from('forklift-catalogs').getPublicUrl(fileName);
          pdfUrl = publicUrl;
        }

        const forkliftData = {
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          category_id: formData.category_id,
          description: formData.description,
          short_description: formData.short_description,
          image_url: imageUrl,
          catalog_pdf_url: pdfUrl,
          available_for_sale: formData.available_for_sale,
          available_for_rental: formData.available_for_rental,
          available_as_used: formData.available_as_used,
          is_published: formData.is_published,
        };

        let forkliftId: string;
        if (isEditMode && id) {
          const { error: updateError } = await supabase
            .from('forklifts')
            .update(forkliftData)
            .eq('id', id);
          if (updateError) throw updateError;
          forkliftId = id;
        } else {
          const { data, error: insertError } = await supabase
            .from('forklifts')
            .insert(forkliftData)
            .select('id')
            .single();
          if (insertError) throw insertError;
          forkliftId = data.id;
        }

        await saveSpecs(forkliftId, specRows);
        navigate('/carretillas');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar la carretilla');
      }
    });
  };

  return (
    <div data-testid="admin-forklift-form" className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" data-testid="forklift-form-title">
          {isEditMode ? 'Editar carretilla' : 'Nueva carretilla'}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            data-testid="cancel-forklift-btn"
            onClick={() => navigate('/carretillas')}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            data-testid="save-forklift-btn"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          data-testid="forklift-form-error"
          className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => setError(null)}
          >
            Cerrar
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div data-testid="forklift-form-loading" className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Form content — only visible when not loading */}
      {!loading && <>

      {/* Basic info */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="forklift-name">
                Nombre *
              </label>
              <Input
                id="forklift-name"
                data-testid="forklift-name-input"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Toyota 8FBE15"
                disabled={isPending}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="forklift-slug">
                Slug *
              </label>
              <Input
                id="forklift-slug"
                data-testid="forklift-slug-input"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="toyota-8fbe15"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="forklift-category">
              Categoría *
            </label>
            <select
              id="forklift-category"
              data-testid="forklift-category-select"
              value={formData.category_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))}
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="forklift-short-description">
              Descripción corta
            </label>
            <textarea
              id="forklift-short-description"
              data-testid="forklift-short-description-input"
              value={formData.short_description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, short_description: e.target.value }))
              }
              rows={2}
              placeholder="Breve descripción visible en listados"
              disabled={isPending}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="forklift-description">
              Descripción completa
            </label>
            <textarea
              id="forklift-description"
              data-testid="forklift-description-input"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={6}
              placeholder="Descripción detallada del producto"
              disabled={isPending}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      <div className="grid grid-cols-2 gap-4">
        {/* Image upload */}
        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="text-sm font-medium">Imagen</p>
            <div
              data-testid="image-drop-zone"
              className={cn(
                'relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors',
                imageDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
              )}
              onClick={() => imageInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setImageDragOver(true);
              }}
              onDragLeave={() => setImageDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setImageDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handleImageFile(file);
              }}
            >
              {imagePreviewUrl ? (
                <>
                  <img
                    data-testid="forklift-image-preview"
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="max-h-36 max-w-full rounded object-contain"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFile(null);
                      setImagePreviewUrl(existingImageUrl);
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <UploadCloud className="size-8" />
                  <span className="text-xs">Arrastra o haz clic para subir</span>
                  <span className="text-xs">JPG, PNG, WebP · máx. 5MB</span>
                </div>
              )}
            </div>
            <input
              ref={imageInputRef}
              data-testid="forklift-image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
              }}
            />
            {existingImageUrl && !imageFile && (
              <p className="text-xs text-muted-foreground">
                Imagen actual.{' '}
                <button
                  type="button"
                  className="underline"
                  onClick={() => imageInputRef.current?.click()}
                >
                  Cambiar
                </button>
              </p>
            )}
          </CardContent>
        </Card>

        {/* PDF upload */}
        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="text-sm font-medium">Catálogo PDF</p>
            <div
              data-testid="pdf-drop-zone"
              className={cn(
                'flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors',
                'border-muted-foreground/25 hover:border-muted-foreground/50',
              )}
              onClick={() => pdfInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handlePdfFile(file);
              }}
            >
              {pdfFileName ? (
                <div className="flex flex-col items-center gap-2 text-sm">
                  <FileText className="size-8 text-primary" />
                  <span data-testid="forklift-pdf-name" className="text-center text-xs break-all px-2">
                    {pdfFileName}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPdfFile(null);
                      setPdfFileName(null);
                      setExistingPdfUrl(null);
                    }}
                  >
                    <X className="size-4 mr-1" /> Quitar
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <UploadCloud className="size-8" />
                  <span className="text-xs">Arrastra o haz clic para subir</span>
                  <span className="text-xs">PDF · máx. 10MB</span>
                </div>
              )}
            </div>
            <input
              ref={pdfInputRef}
              data-testid="forklift-pdf-input"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePdfFile(file);
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Availability */}
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium mb-3">Disponibilidad y estado</p>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                data-testid="forklift-sale-checkbox"
                checked={formData.available_for_sale}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, available_for_sale: e.target.checked }))
                }
                disabled={isPending}
                className="h-4 w-4 rounded border-input"
              />
              Venta
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                data-testid="forklift-rental-checkbox"
                checked={formData.available_for_rental}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, available_for_rental: e.target.checked }))
                }
                disabled={isPending}
                className="h-4 w-4 rounded border-input"
              />
              Alquiler
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                data-testid="forklift-used-checkbox"
                checked={formData.available_as_used}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, available_as_used: e.target.checked }))
                }
                disabled={isPending}
                className="h-4 w-4 rounded border-input"
              />
              Ocasión
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                data-testid="forklift-published-checkbox"
                checked={formData.is_published}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_published: e.target.checked }))
                }
                disabled={isPending}
                className="h-4 w-4 rounded border-input"
              />
              Publicado
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Specs */}
      <Card>
        <CardContent className="p-6">
          <SpecsEditor
            specRows={specRows}
            specNameSuggestions={specNameSuggestions}
            onChange={setSpecRows}
          />
        </CardContent>
      </Card>

      {/* Bottom save */}
      <div className="flex justify-end gap-2 pb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/carretillas')}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>

      </>}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ForkliftCard } from './ForkliftCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorAlert } from './ErrorAlert';
import type { Forklift } from '../lib/types';

interface FeaturedForkliftsCarouselProps {
  limit?: number;
}

export function FeaturedForkliftsCarousel({ limit = 6 }: FeaturedForkliftsCarouselProps) {
  const [forklifts, setForklifts] = useState<Forklift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const { data, error: fetchError } = await supabase
          .from('forklifts')
          .select('*, categories(*)')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (fetchError) throw fetchError;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setForklifts((data || []).map((f: any) => ({ ...f, category: f.categories })));
      } catch {
        setError('No se pudieron cargar los productos destacados.');
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, [limit]);

  if (loading) {
    return (
      <div data-testid="carousel-loading">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (forklifts.length === 0) {
    return (
      <p data-testid="carousel-empty" className="text-center text-muted-foreground py-8">
        No hay productos destacados disponibles en este momento.
      </p>
    );
  }

  return (
    <div
      data-testid="featured-carousel"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {forklifts.map((forklift) => (
        <ForkliftCard key={forklift.id} forklift={forklift} />
      ))}
    </div>
  );
}

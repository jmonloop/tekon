import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from '@/components/CategoryBadge';
import type { Forklift } from '@/lib/types';

interface ForkliftCardProps {
  forklift: Forklift;
}

const PLACEHOLDER_IMAGE = '/images/forklift-placeholder.webp';

export function ForkliftCard({ forklift }: ForkliftCardProps) {
  const { name, short_description, image_url, slug, category } = forklift;
  const href = `/carretillas/${slug}`;

  return (
    <Card className="overflow-hidden p-0 transition-shadow hover:shadow-card-hover">
      <a href={href} tabIndex={-1} aria-hidden="true">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={image_url ?? PLACEHOLDER_IMAGE}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            width={400}
            height={300}
          />
        </div>
      </a>

      <CardContent className="flex flex-col gap-2 pt-4">
        {category && <CategoryBadge name={category.name} />}
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">
          <a href={href} className="hover:text-primary">
            {name}
          </a>
        </h3>
        {short_description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {short_description}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-4">
        <Button asChild size="sm" className="w-full">
          <a href={href}>Ver detalles</a>
        </Button>
      </CardFooter>
    </Card>
  );
}

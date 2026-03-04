// Storage bucket configuration for Supabase Storage

export const STORAGE_BUCKETS = {
  FORKLIFT_IMAGES: 'forklift-images',
  FORKLIFT_CATALOGS: 'forklift-catalogs',
} as const;

export const STORAGE_CONFIG = {
  [STORAGE_BUCKETS.FORKLIFT_IMAGES]: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
    isPublic: true,
  },
  [STORAGE_BUCKETS.FORKLIFT_CATALOGS]: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf'] as const,
    isPublic: true,
  },
} as const;

export function isAllowedMimeType(bucket: keyof typeof STORAGE_CONFIG, mimeType: string): boolean {
  return (STORAGE_CONFIG[bucket].allowedMimeTypes as readonly string[]).includes(mimeType);
}

export function isWithinSizeLimit(bucket: keyof typeof STORAGE_CONFIG, sizeBytes: number): boolean {
  return sizeBytes <= STORAGE_CONFIG[bucket].maxSizeBytes;
}

export function getStoragePath(_bucket: typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS], forkliftId: string, fileName: string): string {
  return `forklifts/${forkliftId}/${fileName}`;
}

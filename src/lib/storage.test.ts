import { describe, it, expect } from 'vitest';
import {
  STORAGE_BUCKETS,
  STORAGE_CONFIG,
  isAllowedMimeType,
  isWithinSizeLimit,
  getStoragePath,
} from './storage';

describe('STORAGE_BUCKETS', () => {
  it('defines forklift-images bucket', () => {
    expect(STORAGE_BUCKETS.FORKLIFT_IMAGES).toBe('forklift-images');
  });

  it('defines forklift-catalogs bucket', () => {
    expect(STORAGE_BUCKETS.FORKLIFT_CATALOGS).toBe('forklift-catalogs');
  });
});

describe('STORAGE_CONFIG — forklift-images', () => {
  const config = STORAGE_CONFIG['forklift-images'];

  it('is public', () => {
    expect(config.isPublic).toBe(true);
  });

  it('has 5MB size limit', () => {
    expect(config.maxSizeBytes).toBe(5 * 1024 * 1024);
  });

  it('allows image/jpeg', () => {
    expect(config.allowedMimeTypes).toContain('image/jpeg');
  });

  it('allows image/png', () => {
    expect(config.allowedMimeTypes).toContain('image/png');
  });

  it('allows image/webp', () => {
    expect(config.allowedMimeTypes).toContain('image/webp');
  });

  it('does not allow application/pdf', () => {
    expect(config.allowedMimeTypes).not.toContain('application/pdf');
  });
});

describe('STORAGE_CONFIG — forklift-catalogs', () => {
  const config = STORAGE_CONFIG['forklift-catalogs'];

  it('is public', () => {
    expect(config.isPublic).toBe(true);
  });

  it('has 10MB size limit', () => {
    expect(config.maxSizeBytes).toBe(10 * 1024 * 1024);
  });

  it('allows application/pdf', () => {
    expect(config.allowedMimeTypes).toContain('application/pdf');
  });

  it('does not allow image types', () => {
    expect(config.allowedMimeTypes).not.toContain('image/jpeg');
    expect(config.allowedMimeTypes).not.toContain('image/png');
    expect(config.allowedMimeTypes).not.toContain('image/webp');
  });
});

describe('isAllowedMimeType', () => {
  it('accepts jpeg for forklift-images', () => {
    expect(isAllowedMimeType('forklift-images', 'image/jpeg')).toBe(true);
  });

  it('accepts png for forklift-images', () => {
    expect(isAllowedMimeType('forklift-images', 'image/png')).toBe(true);
  });

  it('accepts webp for forklift-images', () => {
    expect(isAllowedMimeType('forklift-images', 'image/webp')).toBe(true);
  });

  it('rejects pdf for forklift-images', () => {
    expect(isAllowedMimeType('forklift-images', 'application/pdf')).toBe(false);
  });

  it('rejects gif for forklift-images', () => {
    expect(isAllowedMimeType('forklift-images', 'image/gif')).toBe(false);
  });

  it('accepts pdf for forklift-catalogs', () => {
    expect(isAllowedMimeType('forklift-catalogs', 'application/pdf')).toBe(true);
  });

  it('rejects jpeg for forklift-catalogs', () => {
    expect(isAllowedMimeType('forklift-catalogs', 'image/jpeg')).toBe(false);
  });
});

describe('isWithinSizeLimit', () => {
  it('accepts file within 5MB for forklift-images', () => {
    expect(isWithinSizeLimit('forklift-images', 4 * 1024 * 1024)).toBe(true);
  });

  it('accepts file exactly at 5MB for forklift-images', () => {
    expect(isWithinSizeLimit('forklift-images', 5 * 1024 * 1024)).toBe(true);
  });

  it('rejects file over 5MB for forklift-images', () => {
    expect(isWithinSizeLimit('forklift-images', 5 * 1024 * 1024 + 1)).toBe(false);
  });

  it('accepts file within 10MB for forklift-catalogs', () => {
    expect(isWithinSizeLimit('forklift-catalogs', 8 * 1024 * 1024)).toBe(true);
  });

  it('accepts file exactly at 10MB for forklift-catalogs', () => {
    expect(isWithinSizeLimit('forklift-catalogs', 10 * 1024 * 1024)).toBe(true);
  });

  it('rejects file over 10MB for forklift-catalogs', () => {
    expect(isWithinSizeLimit('forklift-catalogs', 10 * 1024 * 1024 + 1)).toBe(false);
  });

  it('accepts file within 5MB for forklift-images but over 5MB catalog limit mismatch', () => {
    // A 7MB file is too large for images but fine for catalogs
    const sevenMB = 7 * 1024 * 1024;
    expect(isWithinSizeLimit('forklift-images', sevenMB)).toBe(false);
    expect(isWithinSizeLimit('forklift-catalogs', sevenMB)).toBe(true);
  });
});

describe('getStoragePath', () => {
  it('generates correct path for forklift image', () => {
    expect(getStoragePath('forklift-images', 'abc-123', 'photo.jpg')).toBe(
      'forklifts/abc-123/photo.jpg'
    );
  });

  it('generates correct path for forklift catalog', () => {
    expect(getStoragePath('forklift-catalogs', 'xyz-789', 'manual.pdf')).toBe(
      'forklifts/xyz-789/manual.pdf'
    );
  });
});

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dirname, '../..');
const css = readFileSync(join(root, 'src/styles/global.css'), 'utf-8');

describe('Tekon Tailwind theme', () => {
  describe('Brand colors', () => {
    it('defines brand green color token in @theme block', () => {
      expect(css).toContain('--color-brand:');
      // Brand green oklch value for #42FF1E
      expect(css).toContain('oklch(0.872 0.285 141.6)');
    });

    it('defines brand-foreground token for text on brand background', () => {
      expect(css).toContain('--color-brand-foreground:');
    });

    it('defines brand color scale (50, 100, 500, 600, 700, 900)', () => {
      expect(css).toContain('--color-brand-50:');
      expect(css).toContain('--color-brand-100:');
      expect(css).toContain('--color-brand-500:');
      expect(css).toContain('--color-brand-600:');
      expect(css).toContain('--color-brand-700:');
      expect(css).toContain('--color-brand-900:');
    });
  });

  describe('shadcn/ui primary token maps to brand green', () => {
    it('sets --primary to brand green oklch value in :root', () => {
      // Extract :root block content
      const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
      expect(rootMatch).not.toBeNull();
      const rootBlock = rootMatch![1];
      expect(rootBlock).toContain('--primary: oklch(0.872 0.285 141.6)');
    });

    it('sets --ring to brand green for focus rings', () => {
      const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
      const rootBlock = rootMatch![1];
      expect(rootBlock).toContain('--ring: oklch(0.872 0.285 141.6)');
    });

    it('sets dark mode --primary to brand green', () => {
      const darkMatch = css.match(/\.dark\s*\{([^}]+)\}/);
      expect(darkMatch).not.toBeNull();
      const darkBlock = darkMatch![1];
      expect(darkBlock).toContain('--primary: oklch(0.872 0.285 141.6)');
    });

    it('sets sidebar-primary to brand green', () => {
      const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
      const rootBlock = rootMatch![1];
      expect(rootBlock).toContain('--sidebar-primary: oklch(0.872 0.285 141.6)');
    });
  });

  describe('Typography', () => {
    it('configures Inter as the sans-serif font', () => {
      expect(css).toContain("--font-sans: 'Inter'");
    });

    it('imports Inter from Google Fonts', () => {
      expect(css).toContain('fonts.googleapis.com');
      expect(css).toContain('Inter');
    });

    it('applies font-sans to body', () => {
      expect(css).toContain('font-sans');
    });
  });

  describe('Shadow tokens', () => {
    it('defines card shadow token', () => {
      expect(css).toContain('--shadow-card:');
    });

    it('defines card-hover shadow token', () => {
      expect(css).toContain('--shadow-card-hover:');
    });
  });

  describe('CSS structure', () => {
    it('imports Tailwind CSS 4', () => {
      expect(css).toContain('@import "tailwindcss"');
    });

    it('has @theme block for brand tokens', () => {
      // @theme (without inline) for new utility classes
      expect(css).toMatch(/@theme\s*\{/);
    });

    it('has @theme inline block for shadcn/ui semantic tokens', () => {
      expect(css).toContain('@theme inline {');
    });

    it('has no duplicate @apply rules', () => {
      const applyBorderMatches = css.match(/@apply border-border/g) ?? [];
      const applyBgMatches = css.match(/@apply bg-background/g) ?? [];
      expect(applyBorderMatches.length).toBe(1);
      expect(applyBgMatches.length).toBe(1);
    });
  });
});

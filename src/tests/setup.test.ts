import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dirname, '../..');

describe('Project setup', () => {
  describe('Configuration files', () => {
    it('has astro.config.mjs with React and Tailwind', () => {
      const config = readFileSync(join(root, 'astro.config.mjs'), 'utf-8');
      expect(config).toContain('@astrojs/react');
      expect(config).toContain('@tailwindcss/vite');
      expect(config).toContain("output: 'static'");
      expect(config).toContain('carretillastekon.com');
    });

    it('has tsconfig.json with path aliases', () => {
      const tsconfig = JSON.parse(readFileSync(join(root, 'tsconfig.json'), 'utf-8'));
      expect(tsconfig.compilerOptions.paths).toBeDefined();
      expect(tsconfig.compilerOptions.paths['@/*']).toBeDefined();
    });

    it('has components.json (shadcn/ui)', () => {
      expect(existsSync(join(root, 'components.json'))).toBe(true);
    });

    it('has .env.example with required variables', () => {
      const envExample = readFileSync(join(root, '.env.example'), 'utf-8');
      expect(envExample).toContain('PUBLIC_SUPABASE_URL');
      expect(envExample).toContain('PUBLIC_SUPABASE_ANON_KEY');
      expect(envExample).toContain('SUPABASE_SERVICE_ROLE_KEY');
      expect(envExample).toContain('RESEND_API_KEY');
    });
  });

  describe('Project structure', () => {
    const dirs = [
      'src/components',
      'src/layouts',
      'src/lib',
      'src/pages',
      'src/styles',
      'supabase/migrations',
    ];

    for (const dir of dirs) {
      it(`has directory ${dir}`, () => {
        expect(existsSync(join(root, dir))).toBe(true);
      });
    }
  });

  describe('Dependencies', () => {
    it('has package.json with required dependencies', () => {
      const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
      expect(pkg.dependencies['astro']).toBeDefined();
      expect(pkg.dependencies['react']).toMatch(/^19\./);
      expect(pkg.dependencies['react-dom']).toMatch(/^19\./);
      expect(pkg.dependencies['@astrojs/react']).toBeDefined();
      expect(pkg.dependencies['tailwindcss']).toBeDefined();
      expect(pkg.dependencies['@tailwindcss/vite']).toBeDefined();
      expect(pkg.devDependencies['@types/react']).toMatch(/^19\./);
      expect(pkg.devDependencies['@types/react-dom']).toMatch(/^19\./);
    });

    it('has shadcn/ui utility lib', () => {
      expect(existsSync(join(root, 'src/lib/utils.ts'))).toBe(true);
      const utils = readFileSync(join(root, 'src/lib/utils.ts'), 'utf-8');
      expect(utils).toContain('clsx');
      expect(utils).toContain('twMerge');
    });
  });

  describe('Styles', () => {
    it('has global.css with Tailwind 4 import', () => {
      const css = readFileSync(join(root, 'src/styles/global.css'), 'utf-8');
      expect(css).toContain('@import "tailwindcss"');
    });
  });
});

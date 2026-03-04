import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const robotsPath = resolve(process.cwd(), 'public/robots.txt');
const configPath = resolve(process.cwd(), 'astro.config.mjs');

describe('robots.txt', () => {
  let content: string;

  it('file exists', () => {
    content = readFileSync(robotsPath, 'utf-8');
    expect(content).toBeTruthy();
  });

  it('allows all user agents', () => {
    content = readFileSync(robotsPath, 'utf-8');
    expect(content).toContain('User-agent: *');
  });

  it('allows all public pages', () => {
    content = readFileSync(robotsPath, 'utf-8');
    expect(content).toContain('Allow: /');
  });

  it('disallows /admin/ path', () => {
    content = readFileSync(robotsPath, 'utf-8');
    expect(content).toContain('Disallow: /admin/');
  });

  it('includes Sitemap directive pointing to carretillastekon.com', () => {
    content = readFileSync(robotsPath, 'utf-8');
    expect(content).toContain('Sitemap: https://carretillastekon.com');
  });
});

describe('astro.config.mjs sitemap configuration', () => {
  let config: string;

  it('imports @astrojs/sitemap', () => {
    config = readFileSync(configPath, 'utf-8');
    expect(config).toContain("from '@astrojs/sitemap'");
  });

  it('includes sitemap integration', () => {
    config = readFileSync(configPath, 'utf-8');
    expect(config).toContain('sitemap(');
  });

  it('filters out /admin/ pages from sitemap', () => {
    config = readFileSync(configPath, 'utf-8');
    expect(config).toContain('/admin/');
    expect(config).toContain('filter');
  });

  it('has site URL configured', () => {
    config = readFileSync(configPath, 'utf-8');
    expect(config).toContain('site:');
    expect(config).toContain('carretillastekon.com');
  });
});

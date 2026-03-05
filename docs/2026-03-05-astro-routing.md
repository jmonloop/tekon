# Astro Routing

Source: https://docs.astro.build/ar/guides/routing/

## Overview

- File-based routing — URLs auto-generated from `src/pages/` structure
- No separate routing configuration needed

## Static Routes

| File path | URL |
|-----------|-----|
| `src/pages/index.astro` | `mysite.com/` |
| `src/pages/about.astro` | `mysite.com/about` |
| `src/pages/about/index.astro` | `mysite.com/about` |
| `src/pages/posts/1.md` | `mysite.com/posts/1` |

## Dynamic Routes

### SSG (Static Generation)

- Use bracket syntax: `[param]` in filenames
- Must export `getStaticPaths()` returning `{ params }` array

```astro
// src/pages/dogs/[dog].astro
export function getStaticPaths() {
  return [
    { params: { dog: "clifford" }},
    { params: { dog: "rover" }},
  ];
}
const { dog } = Astro.params;
```

Multiple params in one file:
```astro
// src/pages/[lang]-[version]/info.astro
export function getStaticPaths() {
  return [
    { params: { lang: "en", version: "v1" }},
  ];
}
```

### Rest Parameters

- Syntax: `[...path]` — matches variable-depth routes
- `undefined` param matches root

```astro
// src/pages/sequences/[...path].astro
export function getStaticPaths() {
  return [
    { params: { path: "one/two/three" }},
    { params: { path: undefined }} // matches root
  ];
}
```

Can combine: `/[org]/[repo]/tree/[branch]/[...file]`

### SSR (On-Demand Rendering)

- No `getStaticPaths()` needed
- Pages generated on-request for any matching route

```astro
export const prerender = false;
const { resource, id } = Astro.params;
```

## Redirects

### Config-level (permanent)

```javascript
// astro.config.mjs
export default defineConfig({
  redirects: {
    "/old-page": "/new-page",
    "/blog": "https://example.com/blog",
    "/old-page": { status: 302, destination: "/new-page" }
  }
});
```

### Dynamic redirect

```astro
if (!isLoggedIn(cookie)) {
  return Astro.redirect("/login");
}
```

## Rewrites

- `Astro.rewrite()` — serves different content without changing browser URL

```astro
// src/pages/es-cu/articles/introduction.astro
return Astro.rewrite("/es/articles/introduction");
```

- Use cases: localized content variants, conditional 404 content

## Route Priority Order

1. Reserved Astro routes (`_astro/`, `_actions/`, `_server_islands/`)
2. Routes with more path segments
3. Static routes over dynamic
4. Named parameters over rest parameters
5. Pre-rendered over server dynamic routes
6. Endpoints over pages
7. File-based routes over redirects

## Pagination

```astro
export function getStaticPaths({ paginate }) {
  const astronauts = [{ astronaut: "Neil Armstrong" }, ...];
  return paginate(astronauts, { pageSize: 2 });
}
const { page } = Astro.props;
```

`page` object properties:
- `page.data` — current page items
- `page.currentPage` — page number (1-indexed)
- `page.url.next` / `page.url.prev` — navigation links
- `page.lastPage` — total pages
- `page.total` — total item count

### Nested Pagination

```astro
export function getStaticPaths({ paginate }) {
  const allTags = ["red", "blue", "green"];
  return allTags.flatMap((tag) => {
    const filtered = allPosts.filter(p => p.tag === tag);
    return paginate(filtered, { params: { tag }, pageSize: 10 });
  });
}
```

## Excluding Pages

- Prefix with `_` to prevent routing: `_hidden-page.astro`, `_components/`
- Useful for utilities, tests, shared components

## Navigation

```html
<a href="/about/">About</a>
<a href="/docs/reference/">Reference</a>
```

## Key Notes

- Use `decodeURI()` for URL-encoded params
- In SSR, redirects must occur at page level (before HTML streaming starts)
- Reserved routes (`_astro/`, `_actions/`, `_server_islands/`) always take highest priority

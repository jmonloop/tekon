# Tekon Website Rewrite — Design Document

## Overview

Rewrite of [carretillastekon.com](https://www.carretillastekon.com/) from WordPress + Elementor to a modern static site with admin panel. Same sections and content, improved UI, responsive design, and a CMS-like admin for non-technical users to manage the forklift catalog.

## Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Framework | Astro 5 + React 19 islands | Free |
| Components | shadcn/ui + Tailwind CSS 4 | Free |
| Database | Supabase (Postgres) | Free tier |
| Auth | Supabase Auth | Free tier |
| Image storage | Supabase Storage (1GB) | Free tier |
| Rich text editor | tiptap | Free |
| Email | Resend (3,000 emails/month) | Free tier |
| Hosting | Vercel | Free tier |

**Total cost: $0/month** within free tier limits.

## Architecture

Public pages are pre-rendered static HTML by Astro (near-zero JS). Interactive features (search, filters, admin, contact form) are React islands hydrated client-side. Cross-island state sharing uses [nanostores](https://github.com/nanostores/nanostores) (~1KB).

### Hydration Directives

| Component | Directive | Rationale |
|-----------|-----------|-----------|
| SearchBar | `client:load` | Must be interactive immediately |
| FeaturedCarousel | `client:visible` | Below hero, loads when scrolled into view |
| ProductGrid + FilterSidebar | `client:idle` | Can wait for browser idle |
| ContactForm | `client:visible` | Typically at bottom of page |
| AdminApp | `client:only="react"` | Full React SPA, uses browser APIs |

```
src/
  pages/              — Astro pages (public site)
  pages/admin/        — Protected React admin pages
  components/         — Shared components (Header, Footer, ProductCard, etc.)
  components/admin/   — Admin components (ForkliftForm, InquiriesTable)
  layouts/            — Public layout + Admin layout
  lib/                — Supabase client, helpers
  styles/             — Global styles, Tailwind config
supabase/
  migrations/         — SQL migrations
```

## Database Schema

### categories
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | e.g., "Apiladores eléctricos" |
| slug | text | unique, URL-friendly |
| sort_order | int | Display ordering |

### forklifts
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | e.g., "S100" |
| slug | text | unique, URL-friendly |
| category_id | uuid | FK → categories |
| description | text | Full description (markdown) |
| short_description | text | For cards and search results |
| image_url | text | Main image in Supabase Storage |
| catalog_pdf_url | text | Downloadable PDF spec sheet |
| available_for_sale | boolean | Show on sales page |
| available_for_rental | boolean | Show on rental page |
| available_as_used | boolean | Show on used page |
| is_published | boolean | Draft/published toggle |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |
| fts | tsvector | Generated column for full-text search (name + short_description + description); category matched via RPC function |

### forklift_specs
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| forklift_id | uuid | FK → forklifts |
| spec_name | text | e.g., "Capacidad nominal" |
| spec_value | text | e.g., "1000" |
| spec_unit | text | e.g., "kg" |
| sort_order | int | Display ordering |

Specs stored as rows (not columns) so the admin can add/remove spec types without schema changes. Filters on product pages are generated dynamically from distinct `spec_name` values.

### Supabase Storage Buckets
| Bucket | Contents |
|--------|----------|
| forklift-images | Forklift photos (max 5MB, JPG/PNG/WebP) |
| forklift-catalogs | PDF spec sheets (max 10MB) |

### inquiries
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | Sender name/company |
| email | text | Sender email |
| message | text | Message body |
| forklift_id | uuid | FK → forklifts (nullable, if sent from product page) |
| read | boolean | Default false |
| created_at | timestamptz | Auto |

## Public Pages

| Route | Content | Interactive |
|-------|---------|-------------|
| `/` | Hero banner, 3 service cards (sale/rental/used), featured forklifts carousel, about teaser, CTA | Carousel island |
| `/venta-de-carretillas` | Filter sidebar + forklift card grid | React island (filters + search) |
| `/alquiler-de-carretillas` | Same layout, `available_for_rental` forklifts | React island |
| `/carretillas-de-segunda-mano` | Same layout, `available_as_used` forklifts | React island |
| `/carretillas/[slug]` | Image, description, specs table, PDF download, contact form | Contact form island |
| `/nuestras-soluciones` | 4 service sections (repair, maintenance, electronics, rental) + FAQ | Static |
| `/sobre-nosotros` | Company history (since 1989), 6 values | Static |
| `/contacto` | Contact form, phone, address, Google Map embed | Form island |
| `/politica-de-privacidad` | Legal text | Static |
| `/politica-de-cookies` | Legal text | Static |
| `/aviso-legal` | Legal text | Static |

## Global Search

- Search icon in header, expands into input on click
- Debounced (300ms) → calls `search_forklifts` RPC function (full-text search on `fts` column + category name via JOIN)
- Dropdown: up to 8 results with thumbnail, name, category badge
- Click → navigates to `/carretillas/[slug]`
- Empty state: "No se encontraron resultados"
- Escape / click outside → closes

## Product Filters (Sales, Rental, Used Pages)

- Desktop: sidebar. Mobile: bottom sheet triggered by "Filtros" button
- Filters auto-generated from `forklift_specs` distinct `spec_name` values
- Numeric specs (capacity, lift height, speed) → range sliders
- Text specs (power type, operator type) → checkbox groups
- Active filter count as badge on mobile button
- "Limpiar filtros" reset button
- URL params synced (`?capacidad_min=1000&tipo=electrico`) — shareable
- Data pre-rendered at build time for SEO; React island re-fetches on mount for freshness. Filtering is client-side (~20-30 items)

## Admin Panel

Protected by Supabase Auth (email + password). Single admin account.

Single React SPA (`AdminApp.tsx`) with React Router handling all admin views internally. Login is a separate Astro page; all other `/admin/*` routes load the same `AdminApp` island with `client:only="react"`.

| View (React Router) | Purpose |
|---------------------|---------|
| `/admin` | Dashboard: forklift count, unread inquiries |
| `/admin/carretillas` | Forklift list table, search, filter by category, inline publish toggle |
| `/admin/carretillas/nueva` | Create forklift form |
| `/admin/carretillas/:id` | Edit forklift form |
| `/admin/categorias` | Category CRUD (inline edit list) |
| `/admin/consultas` | Inquiries table: name, email, date, forklift, read/unread. Click to expand |

### Forklift Form

- Name, slug (auto-generated), category dropdown
- Short description (plain text for cards/search results)
- Description (tiptap WYSIWYG editor, outputs HTML)
- Image upload (drag & drop → Supabase Storage)
- PDF catalog upload
- Checkboxes: sale / rental / used / published
- **Specs editor**: Dynamic table — "Add spec" button, each row has name, value, unit fields. Drag to reorder. Delete per row. Feels like editing a spreadsheet.

Target: non-technical user adds a new forklift in under 2 minutes.

## Content Rebuild Workflow

`/carretillas/[slug]` pages are static HTML generated at build time. A newly published forklift has no detail page until Vercel rebuilds the site.

**Solution:** Vercel Deploy Hook triggered from the admin panel.

**Flow:**
1. Admin publishes a forklift (sets `is_published = true`)
2. Admin clicks "Rebuild site" button in the admin UI (or it auto-triggers on publish)
3. Admin UI sends a `POST` to the Vercel Deploy Hook URL
4. Vercel rebuilds (~30s) → new static page is live

**Notes:**
- The Deploy Hook URL is stored as env var `VERCEL_DEPLOY_HOOK_URL` (server-side only)
- Listing pages (`/venta-de-carretillas`, `/alquiler-de-carretillas`, `/carretillas-de-segunda-mano`) are unaffected — their React islands re-fetch data from Supabase on mount, so new forklifts appear immediately
- The sitemap.xml also requires a rebuild to include the new detail page URL

## Contact Form Flow

1. User submits form (name, email, message, optional forklift reference)
2. Row inserted into `inquiries` table via Supabase client
3. Supabase Database Webhook triggers Edge Function
4. Edge Function calls Resend API → email to Tekon inbox
5. Admin panel shows inquiry with unread badge

## Styling & Responsive Design

**Theme (matching current brand, modernized):**
- Primary: Tekon green (sampled from current logo/assets)
- White backgrounds, dark gray text
- Cards: white with subtle shadow (modern lift, replacing current left-border style)
- Typography: Inter or similar clean sans-serif

**Breakpoints:**
- Mobile (< 768px): single column, hamburger nav, bottom sheet filters, stacked cards
- Tablet (768-1024px): two-column grid, collapsible sidebar
- Desktop (> 1024px): three-column grid, persistent filter sidebar

## SEO & Local Search Optimization

**Target queries:** "alquiler carretillas Valencia", "venta carretillas Valencia", "carretillas elevadoras Sueca", "montacargas Valencia", and similar.

- **Location-enriched `<title>` and `<meta description>`** on every page. E.g.: "Alquiler de Carretillas Elevadoras en Valencia | Tekon"
- **`<h1>` tags include location** on listing pages: "Alquiler de Carretillas en Valencia"
- **LocalBusiness JSON-LD** on every page: name, address, phone, geo coordinates, service area (Valencia province), opening hours
- **Product JSON-LD** on each forklift detail page: name, category, description, image, availability, brand
- **FAQ structured data** on solutions page: common questions like "¿Cuánto cuesta alquilar una carretilla en Valencia?"
- **Semantic keyword coverage** in intro paragraphs: natural variations ("carretillas elevadoras", "carretillas eléctricas", "montacargas", "Valencia", "Sueca", "provincia de Valencia")
- **Internal linking**: product cards → detail pages, detail pages → category, footer full nav
- **`hreflang="es-ES"`** for Spanish market
- **Sitemap.xml** auto-generated by Astro
- **robots.txt** allowing public pages, blocking `/admin`
- **Open Graph tags** for social sharing

**Performance:**
- Astro `<Image>` component: auto WebP, responsive srcset
- Static pages cached at Vercel edge
- Lighthouse target: 90+ all metrics

## Deployment

1. Supabase project created, schema migrated, storage bucket configured
2. Vercel project connected to git repo
3. Environment variables: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` (client-side), `SUPABASE_SERVICE_ROLE_KEY` (server-side only), `RESEND_API_KEY`, `VERCEL_DEPLOY_HOOK_URL` (server-side only)
4. Push to main → Vercel builds and deploys
5. DNS: point `carretillastekon.com` to Vercel

## Related Documentation (pending)

The following detailed docs are referenced by this design but not yet written:

- `supabase-auth-admin.md` — Auth flow, AuthGuard, RLS policies
- `supabase-setup-schema.md` — Migrations, RPC functions, edge functions
- `astro-react-islands.md` — Islands architecture, nanostores, hydration
- `product-filters-system.md` — Filter sidebar, URL params, client-side filtering

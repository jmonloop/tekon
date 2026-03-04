# Tekon Website Rewrite — PRD

**Status:** Approved
**Created:** 2026-03-04
**Last Updated:** 2026-03-04

## Problem Statement

Carretillastekon.com currently runs on WordPress + Elementor, which is slow, hard to maintain, and expensive to host. The site needs a modern rewrite that delivers fast static pages, a simple admin panel for catalog management, and strong local SEO for the Valencia forklift market — all at $0/month.

## Goals

1. Replace WordPress with a static Astro 5 site achieving Lighthouse 90+ on all metrics
2. Provide a CMS-like admin panel where a non-technical user can add a forklift in under 2 minutes
3. Rank for local forklift queries in Valencia (alquiler/venta carretillas Valencia)
4. Run entirely on free tiers (Supabase, Vercel, Resend)
5. Maintain all existing content and URL structure

## Non-Goals

- Multi-language support (Spanish only)
- Online payments or e-commerce checkout
- User registration or customer accounts
- Mobile app
- Advanced analytics dashboard
- Price listing on product pages

## Context

**Documents consulted:**
- `.claude/docs/supabase-setup-schema.md` — DB schema, migrations, RPC, edge functions
- `.claude/docs/supabase-auth-admin.md` — Auth flow, AuthGuard, RLS policies
- `.claude/docs/astro-react-islands.md` — Islands architecture, nanostores, hydration
- `.claude/docs/product-filters-system.md` — Filter sidebar, URL params, client-side filtering
- `.claude/docs/global-search.md` — Full-text search, RPC function, debounced UI
- `.claude/docs/contact-form-flow.md` — Contact form, email notifications
- `.claude/docs/admin-panel-views.md` — Admin panel views and components
- `.claude/docs/seo-structured-data.md` — SEO, JSON-LD, meta tags
- `docs/plans/2026-03-04-website-rewrite-design.md` — Main design document

**Technical decisions:**
- Astro 5 SSG + React 19 islands (zero JS on static pages, hydrated islands for interactivity)
- Supabase for DB, auth, storage, and edge functions
- EAV pattern for forklift specs (flexible admin, dynamic filters)
- Client-side filtering (dataset ~20-30 items)
- nanostores for cross-island state (~1KB)
- Single React SPA for admin panel inside Astro catch-all route
- Spanish full-text search via tsvector + RPC function
- React 19 features: useActionState, useOptimistic, useTransition
- shadcn/ui + Tailwind CSS 4 for components and styling

---

## Tasks

### Phase 1: Foundation & Infrastructure

- [ ] Task 0: Extract content and assets from current WordPress site
  **Description:** Scrape carretillastekon.com to extract all reusable content before building: (1) forklift data — names, short descriptions, full descriptions, specs, image URLs; (2) brand assets — logo SVG and exact brand green hex color; (3) company text — about page, solutions/services descriptions; (4) legal documents — privacy policy, cookie policy, legal notice. Save structured output (JSON for forklifts, files for assets) to `.claude/extracted/` for use in database seeding and content tasks.
  **Skills to invoke:** /code
  **How to validate:** `.claude/extracted/` contains `forklifts.json`, `brand.json`, and text files for all static pages; logo SVG renders correctly

- [ ] Task 1: Initialize Astro 5 project with React 19 integration
  **Description:** Create Astro 5 project, install `@astrojs/react`, configure React 19, install Tailwind CSS 4 with `@tailwindcss/vite`, initialize shadcn/ui. Set up project structure: `src/pages/`, `src/components/`, `src/layouts/`, `src/lib/`, `src/styles/`, `supabase/migrations/`.
  **Skills to invoke:** /code, `astro-framework`
  **How to validate:** `npm run dev` starts without errors, Tailwind classes render correctly

- [ ] Task 2: Configure Tailwind CSS 4 theme with Tekon branding
  **Description:** Set up CSS-based Tailwind config (`@theme` block) with Tekon brand colors (primary green from logo), Inter font, card shadow tokens, responsive breakpoints (mobile <768px, tablet 768-1024px, desktop >1024px). Configure shadcn/ui theme tokens to match.
  **Skills to invoke:** /code, /tailwind-figma-styles, `astro-framework` (references/styling.md)
  **How to validate:** Theme colors and typography render correctly across breakpoints

- [ ] Task 3: Set up Supabase project and database schema
  **Description:** Create SQL migration files for all 4 tables (`categories`, `forklifts`, `forklift_specs`, `inquiries`) with proper types, constraints, FKs (categories ON DELETE RESTRICT, specs ON DELETE CASCADE, inquiries forklift ON DELETE SET NULL). Add `fts` generated tsvector column on forklifts with GIN index. Create `updated_at` auto-update trigger. Create `search_forklifts` RPC function with category JOIN. Set up Spanish text search config. After migrations apply, seed the database with content extracted in Task 0 (`forklifts.json`) so the site has real data from launch.
  **Skills to invoke:** /code, `supabase-postgres-best-practices` (schema-*, query-*)
  **How to validate:** Migrations apply cleanly to Supabase, `search_forklifts` RPC returns expected results, seeded forklifts appear in listing queries
  **Reference:** `.claude/docs/supabase-setup-schema.md`

- [ ] Task 4: Configure Supabase RLS policies
  **Description:** Implement row-level security: anon can SELECT published forklifts/specs/categories and INSERT inquiries; authenticated gets full CRUD on all tables. Use `auth.role() = 'authenticated'` check (single admin account).
  **Skills to invoke:** /code, `supabase-postgres-best-practices` (security-*)
  **How to validate:** Test queries with anon key (can read published, cannot write forklifts) and service role key (full access)
  **Reference:** `.claude/docs/supabase-auth-admin.md`

- [ ] Task 5: Set up Supabase Storage buckets
  **Description:** Create two public buckets: `forklift-images` (5MB max, JPG/PNG/WebP) and `forklift-catalogs` (10MB max, PDF). RLS: public read, authenticated upload/update/delete.
  **Skills to invoke:** /code, `supabase-postgres-best-practices` (security-*)
  **How to validate:** Can upload and publicly access files via URL

- [ ] Task 6: Create Supabase client modules
  **Description:** Create `src/lib/supabase.ts` with public client (PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_ANON_KEY) and server client (SUPABASE_SERVICE_ROLE_KEY, used only in edge functions). Set up `.env` with all required variables.
  **Skills to invoke:** /code
  **How to validate:** Client connects and queries return data

- [ ] **[VALIDATE]** Task 7: Validate Astro + React island hydration with shadcn/ui
  **Purpose:** Prove that React 19 islands with shadcn/ui components hydrate correctly under each directive (`client:load`, `client:visible`, `client:idle`, `client:only="react"`) and that nanostores share state across independent React trees.
  **Skills to invoke:** /test-driven-development, `astro-framework` (references/client-directives.md, references/components.md)
  **Tests must verify:**
  - A `client:load` island renders and is interactive on page load
  - A `client:visible` island hydrates when scrolled into view
  - nanostores state changes propagate across two independent React islands
  - shadcn/ui Button, Input, Card render correctly inside an island
  **Outcome on failure:** STOP — write findings to `.claude/docs/`

### Phase 2: Shared Components & Layouts

- [ ] Task 8: Build PublicLayout component
  **Description:** Create `src/layouts/Layout.astro` — responsive header (logo, nav links, search icon, hamburger menu on mobile), footer (nav, contact info, legal links). Accepts `title`, `description`, `ogImage`, `jsonLd` props for SEO. Include `hreflang="es-ES"`, canonical URL, Open Graph meta tags.
  **Skills to invoke:** /code, /tailwind-figma-styles, `astro-framework` (references/components.md, references/styling.md)
  **How to validate:** Layout renders on all breakpoints, meta tags present in HTML source
  **Reference:** `.claude/docs/seo-structured-data.md`

- [ ] Task 9: Build AdminLayout component
  **Description:** Create `src/layouts/AdminLayout.astro` — minimal shell with `noindex, nofollow` meta, loads the AdminApp React island with `client:only="react"`. Create catch-all route `src/pages/admin/[...path].astro` serving this layout.
  **Skills to invoke:** /code, `astro-framework` (references/routing.md, references/client-directives.md)
  **How to validate:** `/admin/*` routes load the React SPA shell
  **Reference:** `.claude/docs/supabase-auth-admin.md`

- [ ] Task 10: Build shared UI components
  **Description:** Create reusable components: `ForkliftCard` (image, name, short description, category badge, CTA button), `CategoryBadge`, `LoadingSkeleton`, `ErrorAlert`. These are used across listing pages, search results, and admin.
  **Skills to invoke:** /code
  **How to validate:** Components render correctly with sample data

### Phase 3: Admin Panel

- [ ] **[VALIDATE]** Task 11: Validate React Router SPA inside Astro catch-all route
  **Purpose:** Prove that React Router `BrowserRouter` with `basename="/admin"` works correctly inside an Astro `client:only="react"` island — navigation between views works, browser back/forward works, direct URL access works.
  **Skills to invoke:** /test-driven-development, `astro-framework` (references/routing.md, references/client-directives.md)
  **Tests must verify:**
  - React Router renders correct view for `/admin`, `/admin/carretillas`, `/admin/categorias`
  - Browser navigation (back/forward) works between admin views
  - Direct URL access to `/admin/carretillas` loads correct view
  **Outcome on failure:** STOP — write findings to `.claude/docs/`

- [ ] Task 12: Build Auth system (AuthProvider, AuthGuard, Login page)
  **Description:** Create `AuthProvider` (React context with `getSession()` on mount + `onAuthStateChange` listener), `AuthGuard` (redirects to `/admin/login` if no session, shows loading spinner while checking), login page at `src/pages/admin/login.astro` with email/password form using `signInWithPassword`. Sign-up disabled at Supabase level.
  **Skills to invoke:** /code, `astro-framework` (references/routing.md), `supabase-postgres-best-practices` (security-*)
  **How to validate:** Login works with valid credentials, redirects to dashboard; invalid credentials show error; unauthenticated access to `/admin` redirects to login
  **Reference:** `.claude/docs/supabase-auth-admin.md`

- [ ] Task 13: Build AdminApp SPA shell with React Router
  **Description:** Create `AdminApp.tsx` wrapping `BrowserRouter > AuthProvider > AuthGuard > AdminSidebar + Routes`. Sidebar with nav links to all admin views. React Router routes for all 6 views (dashboard, forklift list, forklift form new/edit, categories, inquiries).
  **Skills to invoke:** /code
  **How to validate:** Navigation between all admin views works, sidebar highlights active route
  **Reference:** `.claude/docs/admin-panel-views.md`

- [ ] Task 14: Build Admin Dashboard view
  **Description:** Dashboard at `/admin` showing stat cards (total forklifts, published count, unread inquiries), quick-access links to create forklift and view inquiries. Uses Supabase queries with count.
  **Skills to invoke:** /code
  **How to validate:** Dashboard shows correct counts from database

- [ ] Task 15: Build Category Management view
  **Description:** Category CRUD at `/admin/categorias` — inline editing (name, slug auto-generated), drag-and-drop reorder (`sort_order`), add new, delete (blocked if category has forklifts via FK RESTRICT, show error alert). Uses Supabase real-time or refetch after mutations.
  **Skills to invoke:** /code
  **How to validate:** Can create, edit, reorder, and delete categories; FK constraint prevents deleting category with forklifts
  **Reference:** `.claude/docs/admin-panel-views.md`

- [ ] Task 16: Build Forklift List view
  **Description:** Forklift table at `/admin/carretillas` — columns: image thumbnail, name, category, published status. Features: text search, category filter dropdown, inline publish/unpublish toggle (optimistic via `useOptimistic`), delete with confirmation dialog. Pagination or virtual scroll if needed.
  **Skills to invoke:** /code
  **How to validate:** List displays forklifts, search/filter work, publish toggle updates DB immediately, delete requires confirmation
  **Reference:** `.claude/docs/admin-panel-views.md`

- [ ] Task 17: Build Forklift Form (create/edit) with SpecsEditor
  **Description:** Form at `/admin/carretillas/nueva` (create) and `/admin/carretillas/:id` (edit, detected via `useParams`). Fields: name, slug (auto-generated from name), category dropdown, short description (plain text), description (tiptap WYSIWYG), image upload (drag & drop → Supabase Storage), PDF catalog upload, 4 checkboxes (sale/rental/used/published). **SpecsEditor subcomponent:** dynamic table with add row, delete row, drag-to-reorder; each row has spec_name (with autocomplete from existing specs), spec_value, spec_unit. Empty rows stripped before save. All specs persisted in batch on form save.
  **Skills to invoke:** /code
  **How to validate:** Can create new forklift with specs, edit existing, upload image/PDF, all data persists correctly
  **Reference:** `.claude/docs/admin-panel-views.md`

- [ ] Task 18: Build Inquiries Management view
  **Description:** Inquiries table at `/admin/consultas` — columns: name, email, date, associated forklift (link), read/unread status. Filter tabs: All/Unread/Read. Expandable rows to show full message. Mark read/unread toggle (optimistic via `useOptimistic`). Delete with confirmation. Link to associated forklift detail page.
  **Skills to invoke:** /code
  **How to validate:** Inquiries display correctly, filter tabs work, read/unread toggle persists, delete works
  **Reference:** `.claude/docs/admin-panel-views.md`

### Phase 4: Public Pages — Interactive

- [ ] Task 19: Build Global Search (SearchBar island)
  **Description:** React island with `client:load` in header. Search icon expands into input. 300ms debounce → calls `search_forklifts` RPC. Dropdown: up to 8 results with thumbnail, name, short description (truncated), category badge. Click navigates to `/carretillas/[slug]`. Close on Escape/click outside. Empty state. Uses nanostores (`$searchQuery`, `$searchResults`, `$isSearchOpen`). AbortController for race condition prevention. Accessibility: `role="search"`, `role="listbox"`, `aria-live="polite"`.
  **Skills to invoke:** /code, `astro-framework` (references/client-directives.md), `supabase-postgres-best-practices` (query-*)
  **How to validate:** Search returns relevant results, debounce works, dropdown appears/disappears correctly, keyboard navigation works
  **Reference:** `.claude/docs/global-search.md`

- [ ] Task 20: Build ForkliftListingIsland (product listing pages)
  **Description:** Single reusable React island parameterized by `availabilityField` prop (`available_for_sale`, `available_for_rental`, `available_as_used`). Fetches forklifts + specs + categories from Supabase. Client-side filtering. Three Astro pages use this island: `/venta-de-carretillas`, `/alquiler-de-carretillas`, `/carretillas-de-segunda-mano`. Data pre-rendered at build for SEO, React re-fetches on mount for freshness.
  **Skills to invoke:** /code, `astro-framework` (references/client-directives.md, references/routing.md), `supabase-postgres-best-practices` (query-*)
  **How to validate:** Each listing page shows correct forklifts for its availability type, grid renders responsively
  **Reference:** `.claude/docs/product-filters-system.md`

- [ ] Task 21: Build Product Filter System
  **Description:** FilterSidebar component with dynamic filters auto-generated from `forklift_specs` distinct `spec_name` values. Numeric specs → range sliders (`Slider`), text specs → checkbox groups. AND across specs, OR within spec. URL param sync via `replaceState` (shareable URLs). Desktop: persistent sidebar (280px). Mobile: bottom `Sheet` with "Filtros" button + active filter count badge. "Limpiar filtros" reset. Spec name normalization for URL keys (lowercase, remove accents, spaces to underscores).
  **Skills to invoke:** /code
  **How to validate:** Filters dynamically generated from specs data, numeric/text detection works, URL params sync bidirectionally, mobile bottom sheet works
  **Reference:** `.claude/docs/product-filters-system.md`

- [ ] Task 22: Build Product Detail pages
  **Description:** Dynamic route `src/pages/carretillas/[slug].astro` — static generation with `getStaticPaths()`. Displays: forklift image (Astro `<Image>` with WebP/srcset), full description (HTML from tiptap), specs table, PDF download link, category breadcrumb, contact form island with forklift reference. Product JSON-LD structured data.
  **Skills to invoke:** /code, `astro-framework` (references/routing.md, references/images.md)
  **How to validate:** Detail pages generate for each published forklift, specs table renders, PDF link works, breadcrumbs correct
  **Reference:** `.claude/docs/seo-structured-data.md`

- [ ] Task 23: Build Contact Form island
  **Description:** React island with `client:visible`. Fields: name, email, message (all required), hidden forklift_id (optional). Uses `useActionState` for form state (idle/pending/success/error). Submits to Supabase `inquiries` table via anon key (RLS allows INSERT). Success: green Alert, form reset. Error: generic red Alert (no schema details leaked). `isPending` disables inputs. On product pages: heading shows forklift name. On contact page: generic heading. Honeypot field for basic spam prevention.
  **Skills to invoke:** /code, `astro-framework` (references/client-directives.md), `supabase-postgres-best-practices` (security-*)
  **How to validate:** Form submits, row appears in inquiries table, success/error states render correctly, honeypot blocks bot submissions
  **Reference:** `.claude/docs/contact-form-flow.md`

### Phase 5: Public Pages — Static

- [ ] Task 24: Build Homepage
  **Description:** Hero banner with CTA, 3 service cards (sale/rental/used linking to respective pages), featured forklifts carousel (`client:visible` island fetching latest published), about teaser section, final CTA. LocalBusiness JSON-LD. SEO-optimized title/description with Valencia location.
  **Skills to invoke:** /code, /tailwind-figma-styles, `astro-framework` (references/components.md, references/images.md)
  **How to validate:** All sections render, carousel works, internal links correct, JSON-LD valid

- [ ] Task 25: Build Solutions page (`/nuestras-soluciones`)
  **Description:** 4 service sections (repair, maintenance, electronics, rental) with descriptions. FAQ section with 5 questions. FAQPage JSON-LD structured data matching visible FAQ content. Static page, no React islands needed.
  **Skills to invoke:** /code, /tailwind-figma-styles, `astro-framework` (references/components.md)
  **How to validate:** All sections render, FAQ JSON-LD matches visible content
  **Reference:** `.claude/docs/seo-structured-data.md`

- [ ] Task 26: Build About page (`/sobre-nosotros`)
  **Description:** Company history (since 1989), 6 company values section. Static page. LocalBusiness JSON-LD.
  **Skills to invoke:** /code, /tailwind-figma-styles, `astro-framework` (references/components.md)
  **How to validate:** Content renders correctly, JSON-LD present

- [ ] Task 27: Build Contact page (`/contacto`)
  **Description:** Contact form island (standalone, no forklift reference), phone number, address, Google Maps embed (`<iframe>` free embed — no API key required). LocalBusiness JSON-LD.
  **Skills to invoke:** /code, `astro-framework` (references/components.md, references/client-directives.md)
  **How to validate:** Form works, map renders, contact info displayed

- [ ] Task 28: Build Legal pages (privacy, cookies, legal notice)
  **Description:** Three static pages at `/politica-de-privacidad`, `/politica-de-cookies`, `/aviso-legal`. Plain text content. No JSON-LD on legal pages.
  **Skills to invoke:** /code, `astro-framework` (references/components.md)
  **How to validate:** Pages render with correct content

### Phase 6: SEO & Performance

- [ ] Task 29: Implement SEO module and structured data
  **Description:** Create `src/lib/seo.ts` with shared constants and generator functions: `localBusinessJsonLd` (Carretillas Tekon, Sueca/Valencia address, M-F 08:00-18:00), `productJsonLd(forklift)` (no price, availability status, references LocalBusiness via @id), `faqJsonLd`. Layout component already accepts `jsonLd` prop. Ensure titles <60 chars with location, descriptions <155 chars. Canonical URLs on every page.
  **Skills to invoke:** /code, `astro-framework` (references/configuration.md)
  **How to validate:** JSON-LD validates with Google's Rich Results Test, meta tags present in source
  **Reference:** `.claude/docs/seo-structured-data.md`

- [ ] Task 30: Configure sitemap.xml and robots.txt
  **Description:** Install `@astrojs/sitemap`, configure to exclude `/admin/*` routes. Create `public/robots.txt` allowing public pages, disallowing `/admin/`.
  **Skills to invoke:** /code, `astro-framework` (references/configuration.md)
  **How to validate:** Sitemap includes all public pages, robots.txt blocks admin

### Phase 7: Email Notifications & Deploy

- [ ] Task 31: Create Supabase Edge Function for inquiry email notifications
  **Description:** Deno-based edge function `send-inquiry-email` triggered by database webhook on `inquiries` INSERT. Uses Resend API to send email to `info@carretillastekon.com` from `noreply@carretillastekon.com`. Includes sender name, email, message, and forklift name (fetched via service role key if `forklift_id` present). Fire-and-forget (inquiry row saved regardless of email success).
  **Skills to invoke:** /code, `supabase-postgres-best-practices` (security-*, conn-*)
  **How to validate:** Insert row in inquiries table → email received at target inbox
  **Reference:** `.claude/docs/contact-form-flow.md`

- [ ] Task 32: Set up Vercel deployment with deploy hook
  **Description:** Connect git repo to Vercel. Configure env vars: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-side), `RESEND_API_KEY`, `VERCEL_DEPLOY_HOOK_URL` (server-side). Add "Rebuild site" button in admin panel that POSTs to deploy hook URL. Push to main triggers build.
  **Skills to invoke:** /code
  **How to validate:** Push to main deploys, admin rebuild button triggers new deployment

- [ ] **[VALIDATE]** Task 33: End-to-end validation
  **Purpose:** Prove full flow works: admin creates forklift → appears on listing page → detail page generated after rebuild → contact form inquiry creates DB row and sends email.
  **Skills to invoke:** /test-driven-development, /verification-before-completion
  **Tests must verify:**
  - Admin login → create forklift with specs and image → forklift appears in listing page
  - Search returns newly created forklift
  - Filters work on listing pages
  - Contact form submission creates inquiry row
  - Email notification fires (or edge function invoked)
  - SEO meta tags and JSON-LD present on all public pages
  - Lighthouse scores 90+ on public pages
  **Outcome on failure:** STOP — write findings to `.claude/docs/`

---

## Non-Functional Requirements

- **Performance:** Lighthouse 90+ all metrics; FCP <1.5s, LCP <2.5s, CLS <0.1, TTI <3s on public pages
- **Security:** All data access via RLS; anon key is public but secure via policies; admin auth via Supabase Auth; no sensitive data in static HTML; service role key server-side only
- **Accessibility:** Semantic HTML, ARIA attributes on interactive elements, keyboard navigable search and forms
- **SEO:** Location-enriched meta tags, JSON-LD structured data, sitemap, Open Graph
- **Browser support:** Modern browsers (Chrome, Firefox, Safari, Edge — latest 2 versions)
- **Responsiveness:** Mobile-first, three breakpoints (mobile <768px, tablet 768-1024px, desktop >1024px)

## Technical Constraints

- Supabase free tier: 500MB DB, 1GB storage, 500K edge function invocations/month
- Resend free tier: 3,000 emails/month
- Vercel free tier: 100GB bandwidth/month
- Astro SSG: no server runtime at request time for public pages (pre-rendered only)
- React islands are independent React roots — no shared React context, must use nanostores
- `client:only="react"` components have no SSR HTML (loading flash on admin)
- tiptap WYSIWYG outputs HTML stored in `description` column

## Dependencies

- **Internal:** Supabase schema must be set up before admin panel or public pages
- **External:** Supabase project (free tier), Vercel account, Resend account
- **Content:** Actual forklift data, company text, legal documents, logo/brand assets from current site

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Supabase free tier limits exceeded | Low | Expected usage well within limits (~10MB DB, ~36MB storage) |
| React 19 + Astro 5 compatibility issues | Medium | Validation task 7 proves integration before building full app |
| tiptap bundle size bloats admin JS | Low | Only loaded in admin (client:only), not on public pages |
| Category or spec name changes break shared URLs | Medium | Document this constraint for admin user; filters use normalized keys |
| Long editing session → auth token expiry | Low | onAuthStateChange auto-refreshes; next failed API call redirects to login |
| Bot spam on contact form | Medium | Honeypot field initially; can add Turnstile/hCaptcha later |
| Vercel rebuild required for new detail pages | Low | Documented in admin UI; listing pages use client-side fetch for immediate visibility |

## Resolved Decisions

| # | Question | Answer |
|---|----------|--------|
| 1 | Content source | Extract from current WordPress website (carretillastekon.com) |
| 2 | Brand assets | Extract from current website (logo, colors) |
| 3 | Google Maps | Free iframe embed — no API key needed |
| 4 | Domain DNS | Skip for now, use placeholder |
| 5 | Admin account | monleon_89@hotmail.com |
| 6 | Actual forklift content | Extract from current website; admin updates later after launch |

## Approval
- [x] User approved

# ITISYOU Platform Handbook

**Version:** 1.0 — Post-polish release
**Owner:** Neela Aravind Karlapudi
**Repository:** https://github.com/leelaravind/itisyou-store

This document is the authoritative technical reference for the ITISYOU Digital Products platform. It is written for the owner, future developers, and any AI agent that needs to maintain, extend, or migrate this system. It describes the **actual implementation** as built, not a hypothetical architecture.

---

## A. Platform Overview

ITISYOU Products is a production-ready full-stack digital product commerce platform. It serves two distinct audiences through two connected areas.

The **public storefront** (accessible at `/`, `/products`, and `/products/:slug`) allows visitors to browse, search, and filter a catalogue of ITISYOU digital products, read detailed product pages including features, pricing, reviews, and system requirements, and click a Buy button that redirects to an external Merchant-of-Record checkout (Lemon Squeezy, Gumroad, or any configured URL). No payment processing occurs within this application.

The **admin dashboard** (accessible at `/admin` and its sub-routes) is a secure, role-gated management interface that allows the owner to add, edit, and delete products; manage pricing and discounts; moderate customer reviews; view first-party analytics; and adjust site appearance settings — all without touching code.

Data flows as follows: an admin creates or edits a product in the dashboard, which writes to the MySQL database via a tRPC mutation. When a visitor loads the storefront, the frontend queries the same database through tRPC procedures and renders the product data dynamically. Analytics events (page views, product views, buy clicks) are written to the `analytics_events` table by server-side procedures and surfaced in the admin analytics panel.

---

## B. Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend framework | React 19 | Component model, concurrent rendering, broad ecosystem |
| Language | TypeScript 5.9 | End-to-end type safety from DB schema to UI |
| Styling | Tailwind CSS 4 + CSS custom properties | Utility-first with a maintainable design token system |
| Component library | shadcn/ui (Radix UI primitives) | Accessible, unstyled primitives with full control |
| API layer | tRPC 11 | Type-safe RPC without REST boilerplate; contracts flow end-to-end |
| Backend runtime | Node.js 22 + Express 4 | Stable, well-understood server runtime |
| ORM | Drizzle ORM | Lightweight, type-safe, SQL-first; migrations are plain SQL |
| Database | MySQL (TiDB-compatible) | Relational, ACID-compliant, free-tier available |
| Authentication | Manus OAuth | Built-in OAuth provider; no external auth service required |
| File storage | S3-compatible (Manus built-in) | Product images stored as S3 objects; URLs stored in DB |
| Routing | Wouter | Lightweight client-side router |
| Animation | CSS transitions + IntersectionObserver | No large animation library; GPU-accelerated transforms only |
| Charts | Recharts | Composable React chart library |
| Testing | Vitest | Fast unit tests co-located with server code |
| Hosting | Manus Autoscale (Cloud Run) | Serverless, auto-scaling, zero-config deployment |

---

## C. Repository Architecture

```
itisyou-store/
├── client/                     # React frontend (Vite)
│   ├── index.html              # Entry HTML; contains no-flash theme script
│   ├── public/
│   │   └── robots.txt          # SEO: disallows /admin and /api
│   └── src/
│       ├── App.tsx             # Route definitions + ThemeProvider
│       ├── index.css           # Design system: CSS tokens, utilities, animations
│       ├── main.tsx            # React root + tRPC/QueryClient providers
│       ├── const.ts            # startLogin() helper
│       ├── _core/hooks/
│       │   └── useAuth.ts      # Auth state hook (wraps trpc.auth.me)
│       ├── components/
│       │   ├── StorefrontLayout.tsx   # Nav + footer shell for all public pages
│       │   ├── ProductCard.tsx        # Reusable product card component
│       │   ├── DashboardLayout.tsx    # Admin sidebar layout (pre-built)
│       │   └── ui/                    # shadcn/ui primitives
│       ├── contexts/
│       │   └── ThemeContext.tsx       # Light/dark theme provider + toggle
│       ├── hooks/
│       │   └── useScrollReveal.ts     # IntersectionObserver scroll reveals
│       ├── lib/
│       │   └── trpc.ts               # tRPC client binding
│       └── pages/
│           ├── Home.tsx              # Homepage (hero, featured, categories, founder)
│           ├── Products.tsx          # Product listing with search/filter/sort
│           ├── ProductDetail.tsx     # Individual product page
│           ├── NotFound.tsx          # 404 page
│           └── admin/
│               ├── AdminLayout.tsx   # Auth guard + sidebar for admin
│               ├── AdminDashboard.tsx
│               ├── AdminProducts.tsx # Product CRUD with image upload
│               ├── AdminReviews.tsx  # Review moderation
│               ├── AdminAnalytics.tsx
│               └── AdminAppearance.tsx # Hero content, theme, founder bio
├── drizzle/
│   ├── schema.ts               # All table definitions (source of truth)
│   ├── relations.ts            # Drizzle relations (currently minimal)
│   ├── migrations/             # Generated migration SQL files
│   └── 0001_*.sql              # Applied migration
├── server/
│   ├── routers.ts              # Root tRPC router (assembles all sub-routers)
│   ├── db.ts                   # All database query helpers
│   ├── storage.ts              # S3 upload/download helpers
│   ├── products.test.ts        # Vitest tests for products + reviews + auth
│   ├── auth.logout.test.ts     # Vitest test for logout
│   └── routers/
│       ├── products.ts         # Products tRPC router (public + admin)
│       ├── reviews.ts          # Reviews tRPC router (public + admin)
│       ├── analytics.ts        # Analytics tRPC router (admin only)
│       └── settings.ts         # Site settings tRPC router (public read, admin write)
│   └── _core/                  # Framework plumbing (DO NOT edit unless extending infra)
│       ├── index.ts            # Express server entry point
│       ├── trpc.ts             # publicProcedure, protectedProcedure, adminProcedure
│       ├── context.ts          # tRPC request context (user, req, res)
│       ├── env.ts              # Environment variable access
│       └── ...
├── shared/
│   ├── const.ts                # COOKIE_NAME and other shared constants
│   └── types.ts                # Shared TypeScript types
├── docs/
│   └── ITISYOU-PLATFORM-HANDBOOK.md   # This document
├── env.template                # Environment variable reference (copy to .env)
├── README.md                   # Quick-start guide
├── todo.md                     # Feature/bug tracking
├── drizzle.config.ts           # Drizzle Kit configuration
├── vite.config.ts              # Vite build configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

---

## D. Frontend Architecture

**Page composition.** Every public page wraps its content in `StorefrontLayout`, which provides the sticky navigation bar, theme toggle, and footer. Admin pages use `AdminLayout`, which enforces authentication and renders the sidebar. Both layouts are thin shells — they do not fetch data themselves.

**Reusable components.** `ProductCard` is the single reusable product display unit used on both the homepage and the products listing page. It receives a product object and renders the icon, name, tagline, status badge, price, and a hover-animated arrow. All status communication (Available, Coming Soon, Featured) uses both colour and an icon+text label to meet WCAG colour-independence requirements.

**Product rendering.** Products are fetched via `trpc.products.list` (listing) or `trpc.products.bySlug` (detail). The detail query also increments the view counter and writes an analytics event server-side. Features and use cases are stored as JSON arrays in the database and parsed in the component.

**Theme system.** The theme is controlled by `ThemeContext`. On mount it reads `localStorage` under the key `iy-theme`; if no stored preference exists it falls back to `window.matchMedia('(prefers-color-scheme: dark)')`. The selected theme is applied by toggling the `.dark` class on `<html>`. A no-flash inline script in `index.html` applies the same logic synchronously before React hydrates, preventing a white flash. All visual properties are expressed as CSS custom properties (`--iy-*`) defined in `:root` (light) and `.dark` (dark) blocks in `index.css`. Tailwind's semantic tokens (`--color-background`, `--color-primary`, etc.) are mapped to the `--iy-*` tokens so shadcn/ui components automatically adapt.

**Responsive system.** Typography uses `clamp()` for fluid scaling between mobile and desktop. The container utility uses `clamp(1rem, 4vw, 3rem)` for horizontal padding. Breakpoints follow Tailwind's defaults: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px). The navigation collapses to a hamburger menu below `md`. Product grids use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.

**Animation system.** Scroll-triggered reveals use a custom `useScrollReveal` hook backed by `IntersectionObserver`. Elements marked with the `.reveal` class start at `opacity: 0; transform: translateY(20px)` and transition to visible when they enter the viewport. Stagger delays (`.stagger-1` through `.stagger-6`) create cascading entrances. All motion is gated behind `@media (prefers-reduced-motion: no-preference)` — when reduced motion is preferred, `.reveal` elements are immediately visible and no transforms are applied.

**Accessibility implementation.** Focus rings use `:focus-visible` with a 2px solid `--iy-focus` outline. Interactive elements have `aria-label` attributes where the visual label is insufficient. Status badges use icon + text, not colour alone. The `<main>` element has `id="main-content"` for skip-link support. Star rating inputs use `role="radiogroup"` and `aria-checked`. Review articles use `<article>` and `<time dateTime>`. Breadcrumbs use `<nav aria-label="Breadcrumb">` with `aria-current="page"` on the current item.

---

## E. Backend Architecture

**APIs.** All backend communication uses tRPC over HTTP at `/api/trpc`. There are no separate REST endpoints for product data. The tRPC router tree is:

```
appRouter
├── system          (health, version — framework-managed)
├── auth
│   ├── me          (public — returns current user or null)
│   └── logout      (public mutation — clears session cookie)
├── products
│   ├── list        (public query — search, filter, sort)
│   ├── featured    (public query)
│   ├── categories  (public query)
│   ├── bySlug      (public query — also increments view + writes analytics)
│   ├── trackBuyClick (public mutation)
│   ├── adminList   (admin only)
│   ├── create      (admin only)
│   ├── update      (admin only)
│   ├── delete      (admin only)
│   └── uploadImage (admin only)
├── reviews
│   ├── forProduct  (public query — approved reviews only)
│   ├── submit      (protected — authenticated users)
│   ├── adminList   (admin only)
│   ├── updateStatus (admin only)
│   ├── reply       (admin only)
│   └── delete      (admin only)
├── analytics
│   └── summary     (admin only — totals + top products + recent orders)
└── settings
    ├── get         (public query — all site settings as key/value map)
    └── set         (admin only mutation)
```

**Database access.** All queries are in `server/db.ts` as named async functions. Procedures import these helpers rather than calling Drizzle directly. This separation means database logic can be tested independently and reused across procedures.

**Admin operations.** The `adminProcedure` middleware (defined in `server/_core/trpc.ts`) checks `ctx.user?.role === 'admin'` and throws `FORBIDDEN` if not. This guard is applied at the procedure level, not the route level, so it cannot be bypassed by URL manipulation.

**Authentication.** Manus OAuth handles the full login flow. The frontend calls `startLogin()` which redirects to the Manus OAuth portal. After the user authenticates, the portal redirects back to `/api/oauth/callback`, which exchanges the code for a session token, upserts the user record in the `users` table, and sets a signed HTTP-only session cookie. Subsequent requests include this cookie; `server/_core/context.ts` verifies it and populates `ctx.user`.

**Validation.** All tRPC procedure inputs are validated with Zod schemas defined inline in the procedure. Invalid inputs are rejected before reaching database helpers.

**Analytics.** The `trackEvent` helper in `server/db.ts` inserts a row into `analytics_events`. It is called server-side from `products.bySlug` (on every product page load) and from `products.trackBuyClick` (when a user clicks Buy). No client-side tracking scripts are used.

**Reviews.** Submitted reviews are stored with `status = 'pending'`. They are not visible on the public storefront until an admin approves them via the Reviews panel. Approved reviews are returned by `reviews.forProduct`.

**Settings.** Site settings are stored as key/value rows in `site_settings`. The `settings.get` procedure returns all settings as a plain object. The homepage reads `hero_headline`, `hero_subheadline`, and `founder_bio` from this object and falls back to hardcoded defaults if the keys are absent.

---

## F. Database

The database uses MySQL (TiDB-compatible). All schema definitions live in `drizzle/schema.ts`. Migrations are generated with `pnpm drizzle-kit generate` and applied via `webdev_execute_sql` or `pnpm drizzle-kit migrate`.

| Table | Purpose | Key fields |
|---|---|---|
| `users` | All authenticated users | `id`, `openId` (Manus OAuth), `role` (user/admin), `email`, `name` |
| `categories` | Product categories | `id`, `slug`, `name`, `sortOrder` |
| `products` | Product catalogue | `id`, `slug`, `name`, `status`, `isFeatured`, `basePrice`, `discountType`, `externalCheckoutUrl`, `categoryId` |
| `product_images` | Product screenshots/icons | `id`, `productId`, `url`, `fileKey`, `sortOrder` |
| `reviews` | Customer reviews | `id`, `productId`, `userId`, `rating`, `status` (pending/approved/rejected/hidden), `adminReply` |
| `orders` | Order records (for future use) | `id`, `productId`, `buyerEmail`, `amount`, `status` |
| `analytics_events` | First-party event log | `id`, `eventType`, `productId`, `path`, `sessionId` |
| `site_settings` | Key/value site configuration | `id`, `key`, `value` |

**Product lifecycle.** An admin creates a product in the Products panel → the `products.create` tRPC mutation inserts a row into `products` with `status = 'available'` or `'coming_soon'` → the `products.list` public query returns it filtered by status → `ProductCard` renders it in the storefront grid → clicking it calls `products.bySlug` which increments `viewCount` and returns the full product object → the detail page renders all fields dynamically from the database row.

**Relationships.** `products.categoryId` → `categories.id`. `product_images.productId` → `products.id`. `reviews.productId` → `products.id`. `reviews.userId` → `users.id`. `orders.productId` → `products.id`. Foreign key constraints are not enforced at the database level in the current schema (Drizzle references are defined for type inference only); application logic maintains referential integrity.

---

## G. Admin Guide

**Logging in.** Navigate to `/admin`. If you are not signed in, you will see a "Sign in required" screen. Click "Sign in" to begin the Manus OAuth flow. After authenticating, you are redirected back. If your account has the `admin` role, the dashboard loads. If not, you see "Access Denied" — contact the owner to promote your account (see below).

**Promoting a user to admin.** In the Manus Management UI, open the Database panel and run: `UPDATE users SET role = 'admin' WHERE email = 'your@email.com';`. The project owner (identified by `OWNER_OPEN_ID` environment variable) is automatically promoted on first login.

**Adding a product.** Go to `/admin/products` → click "Add Product" → fill in the Name, Slug (URL-friendly identifier, e.g. `my-product`), Tagline, Description, Features (as a JSON array: `["Feature 1","Feature 2"]`), Platform, Version, Status, Price, and External Checkout URL → click "Save Product". The product appears on the storefront immediately.

**Editing a product.** In the Products table, click the pencil icon on the row you want to edit. The same form opens pre-populated. Make changes and click "Save Product".

**Hiding a product.** Edit the product and change Status to "Hidden". It will no longer appear on the public storefront but remains in the database.

**Setting a price.** In the product edit form, enter a value in "Base Price" (e.g. `19.99`) and select the currency. Leave Discount Type as "No discount" for a flat price.

**Adding a discount.** Edit the product → set Discount Type to "Percentage" (e.g. `20` for 20% off) or "Fixed" (e.g. `5.00` for £5 off) → enter the Discount Value → Save. The storefront will show the discounted price with the original struck through.

**Uploading a product image.** Edit an existing product (the product must be saved first to have an ID) → scroll to "Product Icon / Image" → click "Upload Image" → select a file. The image is uploaded to S3 and the URL is saved to the product record.

**Changing the checkout URL.** Edit the product → update "External Checkout URL" → Save. The Buy Now button on the product page will redirect to the new URL immediately.

**Moderating reviews.** Go to `/admin/reviews`. Each review shows the reviewer name, rating, status badge, title, and body. Use the green checkmark to approve, the red X to reject, the eye-off icon to hide, or the trash icon to delete permanently. Only approved reviews appear on the public storefront.

**Replying to a review.** Review reply is available via the `reviews.reply` tRPC procedure. The admin reply appears below the review on the public product page under "ITISYOU replied:".

**Changing site appearance.** Go to `/admin/appearance`. You can edit the hero headline, hero subheadline, founder bio, and default theme preference. Click "Save" next to each field individually.

**Viewing analytics.** Go to `/admin/analytics` for total products, users, page views, and buy clicks, plus a bar chart of product performance. Go to `/admin` (Dashboard) for top products by views and recent orders.

---

## H. Theme and Design System

The design system is defined entirely in `client/src/index.css` using CSS custom properties. There are two complete theme sets.

**Light mode tokens (`:root`)**

| Token | Value | Purpose |
|---|---|---|
| `--iy-bg` | `oklch(0.97 0.005 60)` | Warm parchment page background |
| `--iy-surface` | `oklch(1.00 0 0)` | Pure white card surface |
| `--iy-surface-raised` | `oklch(0.99 0.003 60)` | Slightly warm raised surface |
| `--iy-text-primary` | `oklch(0.14 0.010 260)` | Near-black body text |
| `--iy-text-secondary` | `oklch(0.40 0.012 260)` | Secondary text |
| `--iy-text-muted` | `oklch(0.58 0.010 260)` | Muted/placeholder text |
| `--iy-accent` | `oklch(0.62 0.14 48)` | Warm amber brand accent |
| `--iy-border` | `oklch(0.88 0.008 60)` | Subtle warm border |
| `--iy-success` | `oklch(0.52 0.16 145)` | Green (Available badge) |

**Dark mode tokens (`.dark`)**

| Token | Value | Purpose |
|---|---|---|
| `--iy-bg` | `oklch(0.09 0.006 260)` | Deep navy-black background |
| `--iy-surface` | `oklch(0.12 0.008 260)` | Slightly lighter card surface |
| `--iy-surface-raised` | `oklch(0.15 0.009 260)` | Raised surface layer |
| `--iy-text-primary` | `oklch(0.95 0.005 60)` | Warm off-white body text |
| `--iy-accent` | `oklch(0.76 0.13 52)` | Brighter amber for dark backgrounds |

**Typography.** Headings use Playfair Display (serif) loaded from Google Fonts. Body text uses Inter (sans-serif). Heading sizes use `clamp()` for fluid scaling: `h1` scales from `2rem` at 320px to `4.5rem` at large viewports.

**Spacing.** Tailwind's default spacing scale is used throughout. Section vertical padding is `py-14` to `py-20`. Container horizontal padding uses `clamp(1rem, 4vw, 3rem)`.

**Breakpoints.** `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px` (Tailwind defaults).

**Animation conventions.** All motion uses CSS `transition` on `transform` and `opacity` only (GPU-composited properties). Scroll reveals use `IntersectionObserver` via `useScrollReveal`. Duration: 120–200ms for micro-interactions; 500ms for scroll reveals. Easing: `cubic-bezier(0.23, 1, 0.32, 1)` (snappy ease-out).

**Reduced-motion behaviour.** All `.reveal` elements are immediately visible when `prefers-reduced-motion: reduce` is active. Card hover transforms, button press scales, and ambient orbs are all gated behind `@media (prefers-reduced-motion: no-preference)`.

**Accessibility rules.** Minimum contrast ratio: 4.5:1 for normal text (WCAG AA). Focus rings: `2px solid --iy-focus` with `outline-offset: 3px`. Status communication: every status badge uses both colour and an icon+text label. Interactive elements have minimum touch target size of 44×44px (enforced via `w-9 h-9` minimum on icon buttons).

---

## I. Security

**Authentication.** Manus OAuth handles all user authentication. The platform does not store passwords. Session state is maintained via a signed HTTP-only cookie (`COOKIE_NAME`) using `JWT_SECRET`. The cookie has `SameSite=None; Secure` attributes for cross-origin compatibility with the Manus OAuth portal.

**Authorization.** Three procedure tiers exist: `publicProcedure` (no auth required), `protectedProcedure` (any authenticated user), and `adminProcedure` (admin role only). The `adminProcedure` middleware throws `FORBIDDEN` if `ctx.user?.role !== 'admin'`. Admin routes on the frontend also perform a client-side role check and render an "Access Denied" screen, but the server-side guard is the authoritative security boundary.

**Input validation.** All tRPC procedure inputs are validated with Zod schemas before reaching database helpers. Drizzle ORM uses parameterised queries, preventing SQL injection.

**Environment variables.** All secrets (`JWT_SECRET`, `DATABASE_URL`, API keys) are injected via environment variables and never committed to the repository. The `.gitignore` excludes `.env` files. The `env.template` file contains only placeholder values.

**Security assumptions.** The platform assumes Manus hosting provides TLS termination and DDoS protection at the edge. The admin dashboard is not rate-limited beyond what Manus hosting provides. For self-hosted deployments, a reverse proxy with rate limiting is recommended.

---

## J. Environment Variables

All variables are documented in `env.template`. The following table describes each:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | MySQL connection string: `mysql://user:pass@host:port/db` |
| `JWT_SECRET` | Yes | Random string (32+ chars) for signing session cookies |
| `VITE_APP_ID` | Yes | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Yes | Manus OAuth backend URL (typically `https://api.manus.im`) |
| `VITE_OAUTH_PORTAL_URL` | Yes | Manus login portal URL (typically `https://manus.im`) |
| `OWNER_OPEN_ID` | Yes | Manus OpenID of the owner; auto-promoted to admin on first login |
| `OWNER_NAME` | No | Display name for the owner |
| `BUILT_IN_FORGE_API_URL` | Yes | Manus built-in API base URL (for S3 storage) |
| `BUILT_IN_FORGE_API_KEY` | Yes | Server-side API key for Manus built-in APIs |
| `VITE_FRONTEND_FORGE_API_KEY` | Yes | Client-side API key for Manus built-in APIs |
| `VITE_FRONTEND_FORGE_API_URL` | Yes | Client-side API base URL |
| `VITE_ANALYTICS_ENDPOINT` | No | Umami analytics endpoint (optional) |
| `VITE_ANALYTICS_WEBSITE_ID` | No | Umami website ID (optional) |
| `VITE_APP_TITLE` | No | Browser tab title |
| `VITE_APP_LOGO` | No | URL to brand logo image |

In Manus hosting, all variables marked "Yes" are automatically injected. For self-hosted deployments, copy `env.template` to `.env` and fill in all required values.

---

## K. Local Development

```bash
# 1. Clone the repository
git clone https://github.com/leelaravind/itisyou-store.git
cd itisyou-store

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp env.template .env
# Edit .env and fill in DATABASE_URL, JWT_SECRET, and Manus OAuth variables

# 4. Initialize the database
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# 5. Seed initial data (run the INSERT statements from the deployment guide
#    or use the Manus Database panel to apply them)

# 6. Start the development server
pnpm dev
# App runs at http://localhost:3000

# 7. Run tests
pnpm test

# 8. Type-check
pnpm check

# 9. Build for production
pnpm build
pnpm start
```

**Admin bootstrap.** After signing in for the first time, promote your account to admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## L. Production Deployment

### Manus Hosting (primary)

1. Ensure a checkpoint is saved in the Manus Management UI.
2. Click the **Publish** button in the Management UI header.
3. Manus builds the project (`pnpm build`) and deploys it to Autoscale (Cloud Run) hosting.
4. The app is accessible at the auto-generated `*.manus.space` domain.
5. To use a custom domain, go to **Settings → Domains** in the Management UI and add your domain.

### Routing `/products` on `itisyou.app`

`itisyou.app` is managed via Cloudflare. The ITISYOU Products app should be deployed to a subdomain (e.g. `store.itisyou.app`) or the Manus-generated domain. To route `itisyou.app/products` to this app without affecting the root domain:

1. In Cloudflare, create a **Page Rule** or **Transform Rule** that matches `itisyou.app/products*` and proxies it to the Manus-hosted URL.
2. Alternatively, use a Cloudflare Worker to rewrite requests matching `/products` to the Manus deployment URL.
3. The root `itisyou.app` and `space.itisyou.app` continue to serve their existing content unaffected.

> **Important:** Do not point the root `itisyou.app` DNS record to this app unless you intend to replace the existing root experience.

### Self-hosted (Node.js)

```bash
pnpm build
NODE_ENV=production node dist/index.js
```

Set all environment variables before starting. Use a reverse proxy (nginx, Caddy, or Cloudflare Tunnel) for TLS termination.

---

## M. Backup and Restore

**Database backup.** Export the MySQL database using `mysqldump`:
```bash
mysqldump -h HOST -u USER -p DATABASE_NAME > itisyou_backup_$(date +%Y%m%d).sql
```
In Manus hosting, use the Database panel's export feature or connect with the provided connection string.

**Restore.** Import the SQL dump:
```bash
mysql -h HOST -u USER -p DATABASE_NAME < itisyou_backup_20240101.sql
```

**Product images.** Images are stored in S3-compatible object storage managed by Manus. The `url` and `fileKey` fields in `product_images` reference each object. To back up images, use the S3 API with the credentials from `BUILT_IN_FORGE_API_KEY` to list and download all objects under the `products/` prefix.

**Configuration.** Site settings are stored in the `site_settings` table and are included in the database backup. Environment variables must be documented separately (never commit them to Git).

---

## N. Portability and Migration

This platform is designed to be portable. The following table identifies portable vs. provider-specific components:

| Component | Portable | Provider-specific | Migration action |
|---|---|---|---|
| Source code | Yes | No | Push to any Git host |
| Database schema | Yes (standard MySQL) | No | Export SQL dump; import to new MySQL |
| Product data | Yes | No | Included in DB export |
| Product images | Partially | Manus S3 URLs | Re-upload to new S3; update `product_images.url` |
| Authentication | No | Manus OAuth | Replace with Auth0, Clerk, or custom JWT |
| Session cookies | No | Manus JWT format | Regenerate `JWT_SECRET`; users re-login |
| Hosting | No | Manus Cloud Run | Deploy to Railway, Render, Fly.io, or self-host |
| Analytics events | Yes | No | Included in DB export |

**To migrate to a new GitHub repository:**
```bash
git remote add new-origin https://github.com/NEW_USER/NEW_REPO.git
git push new-origin main
```

**To migrate to a new hosting provider:**
1. Export the database and import to the new provider's MySQL instance.
2. Set all environment variables on the new platform.
3. Update `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL` if using a different OAuth provider.
4. Re-upload product images to the new S3 bucket and update URLs in the database.
5. Deploy with `pnpm build && node dist/index.js`.

**To migrate to a new domain:**
1. Update DNS records to point to the new hosting.
2. Update `VITE_OAUTH_PORTAL_URL` and the OAuth callback URL registered with Manus.
3. No code changes are required.

---

## O. Operations

**Adding products.** Use the admin dashboard at `/admin/products`. No code changes required.

**Updating dependencies.** Run `pnpm update` to update all packages to their latest compatible versions. Run `pnpm test` after updating to catch regressions. Review the Drizzle ORM changelog before updating `drizzle-orm` or `drizzle-kit`, as migrations may be affected.

**Reviewing analytics.** Visit `/admin/analytics` for product performance data. For detailed event-level analysis, query the `analytics_events` table directly via the Database panel.

**Checking logs.** In Manus hosting, use `manus-webdev-logs` CLI to view production console logs. For development, check `.manus-logs/devserver.log` and `.manus-logs/browserConsole.log`.

**Deployment rollback.** In the Manus Management UI, open Version History (⋯ menu → Version history) and click "Rollback" on any previous checkpoint.

**Security updates.** Run `pnpm audit` to check for known vulnerabilities. Apply patches with `pnpm update PACKAGE_NAME`.

---

## P. Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Admin shows "Access Denied" | User role is `user`, not `admin` | Run `UPDATE users SET role='admin' WHERE email='...'` in DB panel |
| Products not showing on storefront | Status is `hidden` or DB connection failed | Check product status in admin; check `DATABASE_URL` env var |
| Buy button does nothing | `externalCheckoutUrl` is empty | Edit the product in admin and set the External Checkout URL |
| Images not loading after migration | S3 URLs point to old Manus storage | Re-upload images and update `product_images.url` in DB |
| Theme flash on load | No-flash script not present in `index.html` | Verify the inline `<script>` block before the font links in `index.html` |
| Reviews not appearing | Reviews are in `pending` status | Go to `/admin/reviews` and approve them |
| TypeScript errors after schema change | Migration not applied | Run `pnpm drizzle-kit generate` then apply the SQL via `webdev_execute_sql` |
| Dev server not starting | Port conflict or missing `.env` | Check `.env` exists; run `pnpm dev` from the project root |

---

## Q. Architecture Diagram

```mermaid
graph TD
    subgraph Public["Public Storefront"]
        V[Visitor Browser]
        V -->|HTTPS| CDN[Cloudflare Edge / CDN]
        CDN -->|Proxy /products| APP
    end

    subgraph App["ITISYOU App — Manus Autoscale"]
        APP[Express Server :3000]
        APP -->|Serves| VITE[React SPA — Vite Build]
        APP -->|/api/trpc| TRPC[tRPC Router]
        TRPC --> DB[(MySQL Database)]
        TRPC --> S3[(S3 Object Storage)]
    end

    subgraph Auth["Authentication"]
        V -->|startLogin| OAUTH[Manus OAuth Portal]
        OAUTH -->|/api/oauth/callback| APP
        APP -->|Session cookie| V
    end

    subgraph Admin["Admin Dashboard"]
        ADM[Admin Browser]
        ADM -->|/admin| APP
        APP -->|adminProcedure guard| TRPC
    end

    subgraph Checkout["External Checkout"]
        V -->|Buy Now click| EXT[Lemon Squeezy / Gumroad]
    end

    subgraph Infra["Infrastructure"]
        DB
        S3
        APP
    end
```

---

## R. Change Guide

| What to change | Where to change it |
|---|---|
| Storefront visual design | `client/src/index.css` (CSS tokens), `client/src/components/StorefrontLayout.tsx` |
| Product card layout | `client/src/components/ProductCard.tsx` |
| Product detail page | `client/src/pages/ProductDetail.tsx` |
| Homepage content | `/admin/appearance` (hero, founder bio) or `client/src/pages/Home.tsx` for layout |
| Theme colours | `client/src/index.css` — `:root` (light) and `.dark` (dark) token blocks |
| Admin dashboard | `client/src/pages/admin/Admin*.tsx` |
| Database schema | `drizzle/schema.ts` → `pnpm drizzle-kit generate` → apply SQL |
| Backend procedures | `server/routers/*.ts` and `server/db.ts` |
| Checkout integration | Edit product in `/admin/products` → set External Checkout URL |
| Analytics | `server/db.ts` (`trackEvent`, `getAnalyticsSummary`) + `server/routers/analytics.ts` |
| Deployment | Manus Management UI → Publish; or `pnpm build && node dist/index.js` for self-hosted |
| Adding a new product category | `/admin` is not yet available for category management — insert directly: `INSERT INTO categories (name, slug) VALUES ('New Category', 'new-category');` |

---

*This handbook reflects the platform state as of the final polish release. Update it whenever significant architectural changes are made.*

# ITISYOU — Digital Products Store

A production-ready full-stack e-commerce platform for the **ITISYOU** brand. Built with React 19, TypeScript, tRPC, Drizzle ORM, and MySQL. Features a premium public storefront and a secure admin dashboard.

**Founded by Neela Aravind Karlapudi.**

---

## Features

| Area | Capability |
|---|---|
| **Storefront** | Premium homepage, product catalogue, search, category filter, sort |
| **Product Pages** | Full detail pages with features, pricing, gallery, reviews, buy button |
| **Authentication** | Manus OAuth — secure login/logout, role-based access |
| **Admin Dashboard** | Product CRUD, pricing & discounts, review moderation, analytics |
| **Reviews** | Authenticated users submit reviews; admin approves/rejects/replies |
| **Analytics** | First-party event tracking (page views, product views, buy clicks) |
| **External Checkout** | Buy buttons redirect to Lemon Squeezy / Gumroad / any external URL |
| **Image Storage** | Product images stored in S3-compatible object storage |

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion, Recharts
- **Backend:** Express 4, tRPC 11, Drizzle ORM, MySQL (TiDB compatible)
- **Auth:** Manus OAuth (built-in)
- **Storage:** S3-compatible object storage via Manus built-in APIs
- **Testing:** Vitest (10 tests)

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL or TiDB database

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/itisyou-store.git
cd itisyou-store
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

See `.env.example` for all required variables. The following are automatically injected in the Manus hosting environment and do not need to be set manually when deployed there:

- `DATABASE_URL`
- `JWT_SECRET`
- `VITE_APP_ID`
- `OAUTH_SERVER_URL`
- `VITE_OAUTH_PORTAL_URL`
- `OWNER_OPEN_ID`, `OWNER_NAME`
- `BUILT_IN_FORGE_API_KEY`, `BUILT_IN_FORGE_API_URL`
- `VITE_FRONTEND_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL`

### Database Setup

Run the Drizzle migration to create all tables:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

Or apply the SQL files in `drizzle/` directly to your MySQL database.

### Seed Initial Data

The initial product catalogue (PreflightQC and Bank Statement Format Studio) and site settings are seeded via SQL. See `drizzle/seed.sql` or apply the INSERT statements from the setup guide.

### Development

```bash
pnpm dev
```

The app runs at `http://localhost:3000`.

### Build

```bash
pnpm build
```

### Tests

```bash
pnpm test
```

---

## Admin Access

The admin dashboard is at `/admin`. Access is restricted to users with the `admin` role.

To promote a user to admin, run the following SQL after they have signed in at least once:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

The project owner (identified by `OWNER_OPEN_ID`) is automatically assigned the `admin` role on first login.

---

## Deployment

### Manus Hosting (Recommended)

1. Click **Publish** in the Manus Management UI after saving a checkpoint.
2. The app deploys to Manus Autoscale hosting automatically.
3. To use a custom domain (e.g. `itisyou.app/products`), configure it in **Settings → Domains**.

### Self-Hosted / Cloudflare

The app is a standard Node.js Express server. To deploy on Cloudflare or any VPS:

1. Build: `pnpm build`
2. Set all environment variables on the target platform.
3. Run: `node dist/index.js`
4. Configure your reverse proxy (Cloudflare, nginx, Caddy) to route `/products` to this app.

> **Note:** If `itisyou.app` currently serves another experience at the root, deploy this app to a subdomain or path prefix (e.g. `store.itisyou.app`) and configure Cloudflare to route `/products` requests to this service without affecting the root domain.

---

## External Checkout Configuration

Product purchase buttons redirect to external Merchant-of-Record platforms. To configure:

1. Sign in and go to `/admin/products`.
2. Edit a product and set the **External Checkout URL** field to your Lemon Squeezy, Gumroad, or other checkout link.
3. Save — the Buy button on the storefront will immediately redirect to that URL.

No internal payment processing is built into this platform.

---

## Project Structure

```
client/src/
  pages/          — Storefront pages (Home, Products, ProductDetail)
  pages/admin/    — Admin dashboard pages
  components/     — Shared UI components
drizzle/
  schema.ts       — Database schema (products, reviews, orders, analytics, settings)
server/
  routers/        — tRPC feature routers (products, reviews, analytics, settings)
  db.ts           — Database query helpers
  routers.ts      — Root tRPC router
```

---

## License

© 2024 ITISYOU. All rights reserved.

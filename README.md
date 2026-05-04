KGNA Admin is a lightweight content-admin app for non-technical content updates.

## Prerequisites

- Clerk app and keys
- Neon Postgres database
- Node 20+

## Run

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `KGNA_ADMIN_EMAILS` (comma-separated allow-list)
- `DATABASE_URL` (Neon Postgres connection string)
- `PUBLIC_SITE_URL` (optional metadata only)

## Neon setup

### Add these environment entries in Neon

1. Create a new Neon project (or use an existing one).
2. Copy the pooled connection string from Neon.
3. Register these entries:

```env
DATABASE_URL=postgresql://<DB_USER>:<DB_PASS>@<PROJECT_REF>.pooler.neon.tech/<DB_NAME>?sslmode=require
```

If you prefer direct non-pooled host, replace the hostname with `<PROJECT_REF>.postgres.neon.tech`.

### Seed the database

```bash
pnpm db:generate
pnpm db:migrate
```

### Local `.env.local`

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your Clerk publishable key>
CLERK_SECRET_KEY=<your Clerk secret key>
KGNA_ADMIN_EMAILS=<allowed admin emails, comma-separated>
DATABASE_URL=<neon pooled connection string>
```

### Vercel environment variables

Add the same values under your `kgna-admin` project:

- `NEXT_PUBLIC_APP_URL` (for local dev use `http://localhost:3000`, production value as needed)
- `PUBLIC_SITE_URL` (set to `https://kgna-website.vercel.app` or the target web app URL)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `KGNA_ADMIN_EMAILS`
- `DATABASE_URL` (pooled Neon connection)

## API

- `POST /api/admin/pages/[slug]` (save draft)
- `POST /api/admin/pages/[slug]/publish` (publish)
- `GET /api/admin/pages`
- `GET /api/public/pages`
- `GET /api/public/pages/[slug]`

## Migrations

```bash
pnpm db:generate
pnpm db:migrate
```

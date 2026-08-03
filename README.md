# Ascent

Personal web app to track SSC CGL syllabus prep and MCQ practice.

**Stack:** Next.js · Supabase Auth · Prisma + Postgres · Tailwind · shadcn/ui

## Setup

### 1. Install

```bash
npm install
```

### 2. Env vars

```bash
cp .env.local.example .env.local
```

Fill in:

1. **Supabase Auth** — Project Settings → API  
   `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
2. **Database** — Project Settings → Database → Connection string  
   Put the same URIs in **both** `.env.local` and `.env` (Prisma CLI reads `.env`):

```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres?sslmode=require
DIRECT_URL=postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres?sslmode=require
```

Leave `NEXT_PUBLIC_SITE_URL` unset locally. The app uses the request host for magic-link redirects.

### 3. Create tables (Prisma)

```bash
npm run db:push
npm run db:seed
```

That’s it — no SQL Editor needed.

### 4. Auth (magic link)

Authentication → Providers → **Email** → enable. Login is passwordless (email link). Optionally raise JWT / refresh token lifetime under Authentication → Settings so sessions last longer (app cookies are ~60 days).

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Topics seed automatically on first login.

## Useful commands

| Command | What it does |
|---------|----------------|
| `npm run db:push` | Apply `prisma/schema.prisma` to the database |
| `npm run db:seed` | Seed subjects |
| `npm run db:studio` | Browse data in Prisma Studio |

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard |
| `/syllabus` | Syllabus tracker |
| `/syllabus/[id]` | Topic detail + MCQ logs |
| `/analytics` | Trends & streaks |
| `/login` `/signup` | Auth |

## Deploy (Vercel)

Add these **Environment Variables** in the Vercel project (Production + Preview):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Same as local |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Same as local |
| `NEXT_PUBLIC_SITE_URL` | Optional: `https://ascent-ochre-one.vercel.app`. Leave unset locally. |
| `DATABASE_URL` | Must start with `postgresql://` — use Supabase **Session pooler** URI |
| `DIRECT_URL` | Must start with `postgresql://` — use Supabase **direct** URI |

If your DB password contains `$` or other special characters, URL-encode them (e.g. `$` → `%24`).

Magic links follow **where you clicked Send**:
- Local login → `http://localhost:3000/auth/callback`
- Prod login → `https://ascent-ochre-one.vercel.app/auth/callback`

Also in Supabase → **Authentication → URL Configuration**:
- **Site URL:** `https://ascent-ochre-one.vercel.app`
- **Redirect URLs** (must include all):
  - `https://ascent-ochre-one.vercel.app/**`
  - `https://ascent-ochre-one.vercel.app/auth/callback`
  - `http://localhost:3000/**`
  - `http://localhost:3000/auth/callback`

If localhost is missing from Redirect URLs, Supabase rewrites local magic links to the prod Site URL.

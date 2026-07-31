# SSC CGL Progress Tracker

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

# AI Hot News

AI Hot News is a semi-automated AI news aggregation website focused on global AI product and model updates, with AI tool recommendations as a secondary category.

## Stack

- Next.js App Router
- Vercel
- Neon Postgres
- Drizzle ORM
- Auth.js / NextAuth Credentials login
- RSS/Atom ingestion
- Vitest

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Create an administrator password hash:

   ```bash
   printf '%s' 'your-password' | npm run admin:password
   ```

4. Fill `.env.local` with the Neon connection string, Auth.js secret, administrator email, password hash, and cron secret.

5. Run database migrations:

   ```bash
   npm run db:migrate
   ```

   When changing the Drizzle schema during development, generate a new migration first:

   ```bash
   npm run db:generate
   ```

6. Start the app:

   ```bash
   npm run dev
   ```

## Manual Verification

1. Open `/admin/login`.
2. Sign in with `ADMIN_EMAIL` and the password used to create `ADMIN_PASSWORD_HASH`.
3. Open `/admin/sources`.
4. Add an RSS or Atom source.
5. Click manual fetch.
6. Open `/admin/candidates`.
7. Publish one candidate.
8. Confirm it appears on `/`.
9. Confirm ignored candidates do not appear publicly.
10. Confirm articles from disabled sources do not appear on public pages.

## Vercel Deployment

Create a Neon Postgres project, copy its pooled connection string, and set these environment variables in Vercel:

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `CRON_SECRET`

Run migrations against the Neon database before sending real traffic to the app:

```bash
npm run db:migrate
```

Then connect the GitHub repository to Vercel and deploy.

The cron route is configured in `vercel.json`:

```http
GET /api/cron/fetch
Authorization: Bearer <CRON_SECRET>
```

Vercel will call it every eight hours.

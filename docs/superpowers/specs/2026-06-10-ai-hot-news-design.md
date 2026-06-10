# AI Hot News Website Design

Date: 2026-06-10

## Goal

Build and launch a website that aggregates AI hot news links with a semi-automated editorial workflow.

The first version focuses on global AI product and model updates as the primary category, with AI tool recommendations as a secondary category. Public users read curated news. Administrators manage sources, fetch candidate links, review candidates, and publish selected items.

## Decisions

- Framework: Next.js with App Router.
- Deployment: Vercel.
- Database: Neon Postgres, starting on the free plan.
- ORM: Drizzle ORM.
- Authentication: Auth.js / NextAuth with a Credentials provider for administrator login.
- Content workflow: semi-automated aggregation with administrator review before publication.
- Source management: administrators can add, edit, enable, and disable sources.
- First content sources: RSS and Atom feeds first; simple page parsing may be added only for selected sources later.

## Scope

### In Scope

- Public AI news website.
- Administrator-only source management.
- RSS/Atom candidate ingestion.
- Candidate review and publication workflow.
- Published article management.
- Category and tag filtering.
- Search over published articles.
- Vercel deployment.
- Neon database schema and migrations.
- Manual fetch trigger in the admin interface.
- Cron-compatible fetch endpoint protected by a secret.

### Out of Scope for Version 1

- Public user accounts.
- Visitor-submitted sources.
- Fully automated publishing.
- Complex web crawling.
- AI-generated summaries as a required dependency.
- Email newsletters.
- Personalized feeds.
- Paid subscriptions.
- Real-time ranking.

AI summaries and automatic tagging may be added later. Version 1 must work even when no AI API key is configured.

## Product Structure

### Public Site

The public site presents selected AI news in a way that remains useful even when some original external links are difficult to access from mainland China.

Pages:

- `/`: latest published articles, featured articles, and category entry points.
- `/category/models`: global AI product and model updates.
- `/category/tools`: AI tool recommendations.
- `/sources`: active sources used by the site.
- `/search`: keyword search over published articles.
- `/article/[slug]`: article detail page with summary, source, original link, tags, category, and publication time.

Article cards show:

- Title.
- Short summary.
- Source name.
- Original link.
- Published time.
- Category.
- Tags.
- Featured state when applicable.

### Administrator Area

The administrator area is protected by authentication and role checks.

Pages:

- `/admin`: dashboard with source health, candidate count, recent publications, and recent fetch results.
- `/admin/sources`: add, edit, enable, disable, and test sources.
- `/admin/candidates`: review fetched candidate news; publish, ignore, or edit candidates.
- `/admin/articles`: edit, unpublish, feature, or delete published articles.
- `/admin/settings`: basic administrator and fetch settings.

Only the configured administrator can access these pages. Version 1 uses environment variables for a single administrator email and password hash.

## Architecture

The application is a single Next.js project deployed to Vercel.

Main components:

- Next.js App Router for public pages, admin pages, route handlers, and server actions.
- Neon Postgres for persistent data.
- Drizzle ORM for schema, migrations, and type-safe queries.
- Auth.js / NextAuth for administrator authentication.
- RSS/Atom ingestion service for fetching source feeds.
- Vercel Cron-compatible route for scheduled fetching.

Data flow:

1. Administrator adds a source.
2. Administrator manually triggers fetching, or Vercel Cron calls the fetch route.
3. The ingestion service reads enabled sources.
4. The service fetches RSS/Atom feeds.
5. Feed items are normalized into candidate records.
6. Candidate items are deduplicated by canonical URL hash.
7. Administrator reviews candidates.
8. Approved candidates become published articles.
9. Public pages read only published articles.

## Data Model

### `sources`

Stores administrator-managed news sources.

Fields:

- `id`
- `name`
- `homepage_url`
- `feed_url`
- `category`
- `enabled`
- `last_fetched_at`
- `last_fetch_status`
- `last_fetch_error`
- `created_at`
- `updated_at`

### `candidates`

Stores fetched but unpublished news items.

Fields:

- `id`
- `source_id`
- `title`
- `url`
- `canonical_url_hash`
- `summary`
- `published_at`
- `fetched_at`
- `status`
- `raw_payload`
- `created_at`
- `updated_at`

Candidate statuses:

- `new`
- `published`
- `ignored`

The unique constraint is based on `canonical_url_hash`.

### `articles`

Stores published public articles.

Fields:

- `id`
- `candidate_id`
- `source_id`
- `slug`
- `title`
- `summary`
- `url`
- `category`
- `status`
- `featured`
- `published_at`
- `created_at`
- `updated_at`

Article statuses:

- `published`
- `draft`
- `archived`

Public pages show only `published` articles.

### `tags` and `article_tags`

Stores reusable tags and the many-to-many relation between articles and tags.

Version 1 can use normalized tag tables because filtering and search are part of the public experience.

## Ingestion and Deduplication

RSS/Atom is the primary ingestion method.

The ingestion service must:

- Fetch only enabled sources.
- Parse common RSS and Atom formats.
- Normalize links, titles, summaries, and dates.
- Continue processing other sources if one source fails.
- Store per-source fetch status and error messages.
- Deduplicate items by canonical URL hash.

Canonical URL normalization should:

- Trim whitespace.
- Resolve redirects only if it can be done cheaply and safely.
- Remove common tracking parameters such as `utm_*`.
- Normalize the URL before hashing.

Version 1 does not need title-similarity deduplication.

## Authentication and Authorization

Auth.js / NextAuth handles administrator sign-in with a Credentials provider and JWT sessions.

Authorization rules:

- Only the email configured in `ADMIN_EMAIL` can sign in.
- The submitted password is checked against `ADMIN_PASSWORD_HASH`.
- Admin pages check the server-side session.
- Admin write actions check the server-side session.
- Cron fetching uses `CRON_SECRET`.
- Database credentials and secrets stay in Vercel environment variables.

The public site does not require authentication.

Version 1 does not include public users or a database-backed user management system. Multi-admin support can be added later by moving administrator records into the database or switching to an OAuth provider.

## Error Handling

Fetch failures should be visible to administrators without breaking the whole run.

Rules:

- A failed source does not stop other sources from being processed.
- Each source stores the latest fetch status and error message.
- Candidate creation errors are logged and surfaced in the admin fetch result.
- The cron endpoint returns a summary of processed, created, skipped, and failed sources.
- Public pages show a normal empty state if there are no published articles.

## Deployment

The project deploys to Vercel.

Required environment variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `CRON_SECRET`

Deployment steps:

1. Create a Neon Postgres project.
2. Add the Neon connection string to Vercel as `DATABASE_URL`.
3. Configure Auth.js secret, administrator email, and administrator password hash.
4. Run database migrations.
5. Deploy the Next.js app to Vercel.
6. Configure a custom domain.
7. Configure Vercel Cron for the protected fetch route.

Neon Free is acceptable for version 1. Upgrade when storage approaches the free limit, CU-hour usage regularly approaches the free limit, traffic becomes consistently public, or stronger production guarantees are needed.

## Testing

Version 1 tests focus on the core editorial loop.

Required coverage:

- RSS/Atom parser handles common valid feeds.
- Missing feed fields do not crash ingestion.
- URL canonicalization deduplicates repeated links.
- Non-admin users cannot access admin routes or write actions.
- Candidate publishing creates a public article.
- Public article queries only return published articles.
- A failed source does not stop ingestion for other sources.

Manual verification:

- Add a source.
- Trigger fetch.
- Review candidates.
- Publish an article.
- Confirm the article appears on the public site.
- Confirm ignored candidates stay hidden.

## Future Enhancements

- AI-generated summaries.
- AI tag suggestions.
- Visitor source submissions with moderation.
- Newsletter digest.
- Trending score.
- Multi-language summaries.
- More advanced deduplication using title similarity.
- Source reliability scoring.
- Cloudflare or mainland China hosting strategy if domestic access becomes a hard requirement.

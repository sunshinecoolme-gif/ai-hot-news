# AI Hot News Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and launch the first version of an AI hot news aggregation website with public news pages, administrator-only source management, RSS/Atom candidate ingestion, review, publishing, and Vercel deployment.

**Architecture:** Create a single Next.js App Router application deployed to Vercel. Persist data in Neon Postgres through Drizzle ORM, protect administrator routes with Auth.js Credentials sessions, and keep the ingestion pipeline as testable server-side modules that can run from admin actions or a protected cron route.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Drizzle ORM, Neon Postgres, Auth.js / NextAuth, Vitest, Testing Library, RSS/Atom parsing with `fast-xml-parser`, password hashing with `bcryptjs`.

---

## File Structure

Create these files and directories:

- `package.json`: scripts and dependencies.
- `next.config.ts`: Next.js configuration.
- `tsconfig.json`: TypeScript configuration.
- `postcss.config.mjs`: Tailwind/PostCSS configuration.
- `tailwind.config.ts`: Tailwind content and theme configuration.
- `vitest.config.ts`: unit test configuration.
- `.env.example`: required environment variables.
- `.gitignore`: ignore dependencies, build output, env files, local Superpowers visual artifacts.
- `drizzle.config.ts`: Drizzle migration configuration.
- `src/app/layout.tsx`: root layout.
- `src/app/page.tsx`: public homepage.
- `src/app/category/[category]/page.tsx`: category page.
- `src/app/search/page.tsx`: search page.
- `src/app/sources/page.tsx`: source list page.
- `src/app/article/[slug]/page.tsx`: article detail page.
- `src/app/admin/page.tsx`: admin dashboard.
- `src/app/admin/login/page.tsx`: admin login page.
- `src/app/admin/sources/page.tsx`: source management page.
- `src/app/admin/candidates/page.tsx`: candidate review page.
- `src/app/admin/articles/page.tsx`: published article management page.
- `src/app/admin/settings/page.tsx`: admin settings page.
- `src/app/api/auth/[...nextauth]/route.ts`: Auth.js route.
- `src/app/api/cron/fetch/route.ts`: protected cron ingestion route.
- `src/app/globals.css`: global styles.
- `src/components/admin/*`: small admin UI components.
- `src/components/public/*`: public article/source UI components.
- `src/db/client.ts`: database client.
- `src/db/schema.ts`: Drizzle schema.
- `src/db/queries/*`: public and admin query helpers.
- `src/lib/auth.ts`: Auth.js configuration and admin guard helpers.
- `src/lib/env.ts`: environment validation.
- `src/lib/ingestion/canonical-url.ts`: URL normalization and hash helpers.
- `src/lib/ingestion/feed-parser.ts`: RSS/Atom parser.
- `src/lib/ingestion/fetch-sources.ts`: source ingestion orchestration.
- `src/lib/slug.ts`: slug generation.
- `src/lib/time.ts`: date formatting helpers.
- `src/server/actions/*`: server actions for sources, candidates, articles, and auth.
- `src/test/fixtures/*`: RSS/Atom fixtures.
- `src/test/setup.ts`: test setup.
- `src/**/*.test.ts`: focused unit tests.
- `vercel.json`: Vercel Cron configuration.
- `README.md`: local development and deployment instructions.

---

### Task 1: Scaffold Next.js App and Test Tooling

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Create the project manifest**

Create `package.json`:

```json
{
  "name": "ai-hot-news",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "admin:password": "tsx scripts/hash-password.ts"
  },
  "dependencies": {
    "@auth/drizzle-adapter": "^1.0.0",
    "@neondatabase/serverless": "^0.10.4",
    "bcryptjs": "^2.4.3",
    "clsx": "^2.1.1",
    "drizzle-orm": "^0.36.4",
    "fast-xml-parser": "^4.5.0",
    "next": "^15.0.0",
    "next-auth": "^5.0.0-beta.25",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.27.1",
    "eslint": "^9.16.0",
    "eslint-config-next": "^15.0.0",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create TypeScript and framework config**

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb"
    }
  }
};

export default nextConfig;
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;
```

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141414",
        paper: "#f7f6f2",
        line: "#dedbd2",
        signal: "#2563eb",
        mint: "#0f766e"
      }
    }
  },
  plugins: []
};

export default config;
```

- [ ] **Step 3: Create test config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"]
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";

process.env.DATABASE_URL ??= "postgres://user:pass@example.com/db?sslmode=require";
process.env.AUTH_SECRET ??= "test-auth-secret-with-enough-length";
process.env.ADMIN_EMAIL ??= "admin@example.com";
process.env.ADMIN_PASSWORD_HASH ??= "$2a$10$abcdefghijklmnopqrstuu7oI5A6Z3P9s2lWl2M6Z9Qh3Xq9G4Q8e";
process.env.CRON_SECRET ??= "test-cron-secret-with-enough-length";
```

- [ ] **Step 4: Create base app files**

Create `.gitignore`:

```gitignore
node_modules
.next
out
coverage
.env
.env*.local
drizzle/meta
.superpowers
```

Create `.env.example`:

```bash
DATABASE_URL="postgres://user:password@host/db?sslmode=require"
AUTH_SECRET="replace-with-random-secret"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD_HASH="replace-with-bcrypt-hash"
CRON_SECRET="replace-with-random-secret"
```

Create `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
  background: #f7f6f2;
  color: #141414;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #f7f6f2;
  color: #141414;
}

a {
  color: inherit;
  text-decoration: none;
}
```

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Hot News",
  description: "Curated AI product, model, and tool updates."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
      <header className="border-b border-line pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-mint">AI Hot News</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">AI 热点新闻</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-700">
          聚合全球 AI 产品、模型动态和实用工具推荐。
        </p>
      </header>
    </main>
  );
}
```

- [ ] **Step 5: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules` and `package-lock.json` are created.

- [ ] **Step 6: Verify scaffold**

Run:

```bash
npm run test
npm run build
```

Expected: tests complete with no test files or passing setup; build completes and renders the starter page.

- [ ] **Step 7: Commit**

```bash
git add .gitignore .env.example package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs tailwind.config.ts vitest.config.ts src/app src/test
git commit -m "chore: scaffold Next.js app"
```

---

### Task 2: Add Environment Validation, Drizzle Schema, and Database Client

**Files:**
- Create: `drizzle.config.ts`
- Create: `src/lib/env.ts`
- Create: `src/db/schema.ts`
- Create: `src/db/client.ts`
- Create: `src/lib/env.test.ts`
- Create: `src/db/schema.test.ts`

- [ ] **Step 1: Write environment validation tests**

Create `src/lib/env.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("parses required environment variables", () => {
    const env = parseEnv({
      DATABASE_URL: "postgres://user:pass@example.com/db?sslmode=require",
      AUTH_SECRET: "test-auth-secret-with-enough-length",
      ADMIN_EMAIL: "admin@example.com",
      ADMIN_PASSWORD_HASH: "$2a$10$abcdefghijklmnopqrstuu7oI5A6Z3P9s2lWl2M6Z9Qh3Xq9G4Q8e",
      CRON_SECRET: "test-cron-secret-with-enough-length"
    });

    expect(env.ADMIN_EMAIL).toBe("admin@example.com");
  });

  it("rejects invalid administrator email", () => {
    expect(() =>
      parseEnv({
        DATABASE_URL: "postgres://user:pass@example.com/db?sslmode=require",
        AUTH_SECRET: "test-auth-secret-with-enough-length",
        ADMIN_EMAIL: "not-an-email",
        ADMIN_PASSWORD_HASH: "hash",
        CRON_SECRET: "test-cron-secret-with-enough-length"
      })
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run the failing environment test**

Run:

```bash
npm run test -- src/lib/env.test.ts
```

Expected: FAIL because `src/lib/env.ts` does not exist.

- [ ] **Step 3: Implement environment validation**

Create `src/lib/env.ts`:

```ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(16),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD_HASH: z.string().min(20),
  CRON_SECRET: z.string().min(16)
});

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(input: NodeJS.ProcessEnv): AppEnv {
  return envSchema.parse(input);
}

export const env = parseEnv(process.env);
```

- [ ] **Step 4: Write schema tests**

Create `src/db/schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { articles, candidates, sources } from "./schema";

describe("database schema", () => {
  it("defines the core tables", () => {
    expect(sources).toBeDefined();
    expect(candidates).toBeDefined();
    expect(articles).toBeDefined();
  });
});
```

- [ ] **Step 5: Run the failing schema test**

Run:

```bash
npm run test -- src/db/schema.test.ts
```

Expected: FAIL because `src/db/schema.ts` does not exist.

- [ ] **Step 6: Implement Drizzle configuration and schema**

Create `drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ""
  }
});
```

Create `src/db/schema.ts`:

```ts
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", ["models", "tools"]);
export const candidateStatusEnum = pgEnum("candidate_status", ["new", "published", "ignored"]);
export const articleStatusEnum = pgEnum("article_status", ["draft", "published", "archived"]);
export const fetchStatusEnum = pgEnum("fetch_status", ["never", "success", "failed"]);

export const sources = pgTable(
  "sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    homepageUrl: text("homepage_url").notNull(),
    feedUrl: text("feed_url").notNull(),
    category: categoryEnum("category").notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
    lastFetchStatus: fetchStatusEnum("last_fetch_status").default("never").notNull(),
    lastFetchError: text("last_fetch_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    feedUrlIdx: uniqueIndex("sources_feed_url_idx").on(table.feedUrl),
    enabledIdx: index("sources_enabled_idx").on(table.enabled)
  })
);

export const candidates = pgTable(
  "candidates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    canonicalUrlHash: text("canonical_url_hash").notNull(),
    summary: text("summary"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
    status: candidateStatusEnum("status").default("new").notNull(),
    rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    canonicalHashIdx: uniqueIndex("candidates_canonical_url_hash_idx").on(table.canonicalUrlHash),
    sourceStatusIdx: index("candidates_source_status_idx").on(table.sourceId, table.status)
  })
);

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "set null" }),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "restrict" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    url: text("url").notNull(),
    category: categoryEnum("category").notNull(),
    status: articleStatusEnum("status").default("published").notNull(),
    featured: boolean("featured").default(false).notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    slugIdx: uniqueIndex("articles_slug_idx").on(table.slug),
    statusPublishedIdx: index("articles_status_published_at_idx").on(table.status, table.publishedAt)
  })
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    slugIdx: uniqueIndex("tags_slug_idx").on(table.slug)
  })
);

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" })
  },
  (table) => ({
    articleTagIdx: uniqueIndex("article_tags_article_id_tag_id_idx").on(table.articleId, table.tagId)
  })
);
```

Create `src/db/client.ts`:

```ts
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { env } from "@/lib/env";
import * as schema from "./schema";

const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, { schema });
```

- [ ] **Step 7: Verify schema and env tests**

Run:

```bash
npm run test -- src/lib/env.test.ts src/db/schema.test.ts
npm run db:generate
```

Expected: tests pass; Drizzle migration files are generated in `drizzle/`.

- [ ] **Step 8: Commit**

```bash
git add drizzle.config.ts drizzle src/lib/env.ts src/lib/env.test.ts src/db/schema.ts src/db/schema.test.ts src/db/client.ts
git commit -m "feat: add database schema"
```

---

### Task 3: Implement URL Canonicalization, Slugs, and Feed Parsing

**Files:**
- Create: `src/lib/ingestion/canonical-url.ts`
- Create: `src/lib/ingestion/canonical-url.test.ts`
- Create: `src/lib/slug.ts`
- Create: `src/lib/slug.test.ts`
- Create: `src/lib/ingestion/feed-parser.ts`
- Create: `src/lib/ingestion/feed-parser.test.ts`
- Create: `src/test/fixtures/openai-rss.xml`
- Create: `src/test/fixtures/google-atom.xml`

- [ ] **Step 1: Write canonical URL tests**

Create `src/lib/ingestion/canonical-url.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { canonicalizeUrl, hashCanonicalUrl } from "./canonical-url";

describe("canonicalizeUrl", () => {
  it("removes tracking parameters and normalizes host casing", () => {
    expect(canonicalizeUrl(" https://Example.com/Post?utm_source=x&id=42&utm_medium=email ")).toBe(
      "https://example.com/Post?id=42"
    );
  });

  it("removes a trailing slash from non-root paths", () => {
    expect(canonicalizeUrl("https://example.com/news/")).toBe("https://example.com/news");
  });
});

describe("hashCanonicalUrl", () => {
  it("returns the same hash for equivalent URLs", () => {
    expect(hashCanonicalUrl("https://example.com/a?utm_campaign=x")).toBe(hashCanonicalUrl("https://example.com/a"));
  });
});
```

- [ ] **Step 2: Run canonical URL tests to verify failure**

Run:

```bash
npm run test -- src/lib/ingestion/canonical-url.test.ts
```

Expected: FAIL because `canonical-url.ts` does not exist.

- [ ] **Step 3: Implement canonical URL helpers**

Create `src/lib/ingestion/canonical-url.ts`:

```ts
import { createHash } from "node:crypto";

const TRACKING_PARAM_PREFIXES = ["utm_"];
const TRACKING_PARAMS = new Set(["fbclid", "gclid", "mc_cid", "mc_eid", "ref"]);

export function canonicalizeUrl(input: string): string {
  const url = new URL(input.trim());
  url.hostname = url.hostname.toLowerCase();

  for (const key of Array.from(url.searchParams.keys())) {
    if (TRACKING_PARAMS.has(key) || TRACKING_PARAM_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      url.searchParams.delete(key);
    }
  }

  url.searchParams.sort();

  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}

export function hashCanonicalUrl(input: string): string {
  return createHash("sha256").update(canonicalizeUrl(input)).digest("hex");
}
```

- [ ] **Step 4: Write and implement slug tests**

Create `src/lib/slug.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createSlug } from "./slug";

describe("createSlug", () => {
  it("creates a lowercase URL-safe slug", () => {
    expect(createSlug("OpenAI Releases GPT-5.5!")).toBe("openai-releases-gpt-5-5");
  });

  it("falls back to news when input has no usable letters or numbers", () => {
    expect(createSlug("!!!")).toBe("news");
  });
});
```

Create `src/lib/slug.ts`:

```ts
export function createSlug(input: string): string {
  const slug = input
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "news";
}
```

- [ ] **Step 5: Create feed fixtures**

Create `src/test/fixtures/openai-rss.xml`:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>OpenAI News</title>
    <item>
      <title>New model release</title>
      <link>https://openai.com/news/model?utm_source=rss</link>
      <description>A short model update.</description>
      <pubDate>Wed, 10 Jun 2026 08:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>
```

Create `src/test/fixtures/google-atom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>AI Updates</title>
  <entry>
    <title>Tool launch</title>
    <link href="https://example.com/tools/launch?utm_campaign=feed" />
    <summary>A practical AI tool launch.</summary>
    <updated>2026-06-10T09:30:00Z</updated>
  </entry>
</feed>
```

- [ ] **Step 6: Write feed parser tests**

Create `src/lib/ingestion/feed-parser.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFeed } from "./feed-parser";

function fixture(name: string) {
  return readFileSync(join(process.cwd(), "src/test/fixtures", name), "utf8");
}

describe("parseFeed", () => {
  it("parses RSS items", () => {
    const items = parseFeed(fixture("openai-rss.xml"));

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: "New model release",
      url: "https://openai.com/news/model?utm_source=rss",
      summary: "A short model update."
    });
    expect(items[0].publishedAt?.toISOString()).toBe("2026-06-10T08:00:00.000Z");
  });

  it("parses Atom entries", () => {
    const items = parseFeed(fixture("google-atom.xml"));

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: "Tool launch",
      url: "https://example.com/tools/launch?utm_campaign=feed",
      summary: "A practical AI tool launch."
    });
  });
});
```

- [ ] **Step 7: Implement feed parser**

Create `src/lib/ingestion/feed-parser.ts`:

```ts
import { XMLParser } from "fast-xml-parser";

export type ParsedFeedItem = {
  title: string;
  url: string;
  summary: string | null;
  publishedAt: Date | null;
  raw: Record<string, unknown>;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text"
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string | null {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "#text" in value) {
    return text((value as { "#text": unknown })["#text"]);
  }
  return null;
}

function parseDate(value: unknown): Date | null {
  const raw = text(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function atomLink(link: unknown): string | null {
  if (Array.isArray(link)) {
    const alternate = link.find((item) => item && typeof item === "object" && (item as Record<string, unknown>)["@_href"]);
    return atomLink(alternate);
  }
  if (typeof link === "string") return link;
  if (link && typeof link === "object") {
    const href = (link as Record<string, unknown>)["@_href"];
    return typeof href === "string" ? href : null;
  }
  return null;
}

export function parseFeed(xml: string): ParsedFeedItem[] {
  const parsed = parser.parse(xml) as Record<string, unknown>;

  if (parsed.rss && typeof parsed.rss === "object") {
    const channel = (parsed.rss as Record<string, unknown>).channel as Record<string, unknown>;
    return asArray(channel.item as Record<string, unknown> | Record<string, unknown>[]).flatMap((item) => {
      const title = text(item.title);
      const url = text(item.link);
      if (!title || !url) return [];
      return [
        {
          title,
          url,
          summary: text(item.description),
          publishedAt: parseDate(item.pubDate),
          raw: item
        }
      ];
    });
  }

  if (parsed.feed && typeof parsed.feed === "object") {
    const feed = parsed.feed as Record<string, unknown>;
    return asArray(feed.entry as Record<string, unknown> | Record<string, unknown>[]).flatMap((entry) => {
      const title = text(entry.title);
      const url = atomLink(entry.link);
      if (!title || !url) return [];
      return [
        {
          title,
          url,
          summary: text(entry.summary) ?? text(entry.content),
          publishedAt: parseDate(entry.updated) ?? parseDate(entry.published),
          raw: entry
        }
      ];
    });
  }

  return [];
}
```

- [ ] **Step 8: Verify parsing and helpers**

Run:

```bash
npm run test -- src/lib/ingestion/canonical-url.test.ts src/lib/slug.test.ts src/lib/ingestion/feed-parser.test.ts
```

Expected: all tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/lib/ingestion src/lib/slug.ts src/lib/slug.test.ts src/test/fixtures
git commit -m "feat: add feed parsing helpers"
```

---

### Task 4: Implement Ingestion Orchestration

**Files:**
- Create: `src/lib/ingestion/fetch-sources.ts`
- Create: `src/lib/ingestion/fetch-sources.test.ts`

- [ ] **Step 1: Write ingestion orchestration tests**

Create `src/lib/ingestion/fetch-sources.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { ingestSources, type IngestDb, type SourceForIngest } from "./fetch-sources";

const rss = `<?xml version="1.0"?><rss version="2.0"><channel><item><title>Model news</title><link>https://example.com/a?utm_source=x</link><description>Summary</description><pubDate>Wed, 10 Jun 2026 08:00:00 GMT</pubDate></item></channel></rss>`;

function createDb(sources: SourceForIngest[]): IngestDb {
  const created: unknown[] = [];
  return {
    listEnabledSources: vi.fn(async () => sources),
    createCandidateIfNew: vi.fn(async (candidate) => {
      created.push(candidate);
      return true;
    }),
    markSourceSuccess: vi.fn(async () => undefined),
    markSourceFailure: vi.fn(async () => undefined)
  };
}

describe("ingestSources", () => {
  it("creates candidates from enabled sources", async () => {
    const db = createDb([
      {
        id: "source-1",
        name: "Example",
        feedUrl: "https://example.com/feed.xml",
        category: "models"
      }
    ]);
    const fetchText = vi.fn(async () => rss);

    const result = await ingestSources({ db, fetchText });

    expect(result.created).toBe(1);
    expect(db.createCandidateIfNew).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceId: "source-1",
        title: "Model news",
        url: "https://example.com/a?utm_source=x"
      })
    );
    expect(db.markSourceSuccess).toHaveBeenCalledWith("source-1");
  });

  it("continues when one source fails", async () => {
    const db = createDb([
      { id: "bad", name: "Bad", feedUrl: "https://bad.example/feed.xml", category: "models" },
      { id: "good", name: "Good", feedUrl: "https://good.example/feed.xml", category: "tools" }
    ]);
    const fetchText = vi.fn(async (url: string) => {
      if (url.includes("bad")) throw new Error("network failed");
      return rss;
    });

    const result = await ingestSources({ db, fetchText });

    expect(result.failed).toBe(1);
    expect(result.created).toBe(1);
    expect(db.markSourceFailure).toHaveBeenCalledWith("bad", "network failed");
    expect(db.markSourceSuccess).toHaveBeenCalledWith("good");
  });
});
```

- [ ] **Step 2: Run ingestion tests to verify failure**

Run:

```bash
npm run test -- src/lib/ingestion/fetch-sources.test.ts
```

Expected: FAIL because `fetch-sources.ts` does not exist.

- [ ] **Step 3: Implement ingestion orchestration**

Create `src/lib/ingestion/fetch-sources.ts`:

```ts
import { canonicalizeUrl, hashCanonicalUrl } from "./canonical-url";
import { parseFeed } from "./feed-parser";

export type SourceForIngest = {
  id: string;
  name: string;
  feedUrl: string;
  category: "models" | "tools";
};

export type CandidateInput = {
  sourceId: string;
  title: string;
  url: string;
  canonicalUrlHash: string;
  summary: string | null;
  publishedAt: Date | null;
  rawPayload: Record<string, unknown>;
};

export type IngestDb = {
  listEnabledSources(): Promise<SourceForIngest[]>;
  createCandidateIfNew(candidate: CandidateInput): Promise<boolean>;
  markSourceSuccess(sourceId: string): Promise<void>;
  markSourceFailure(sourceId: string, message: string): Promise<void>;
};

export type IngestResult = {
  processed: number;
  created: number;
  skipped: number;
  failed: number;
};

export async function defaultFetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "AIHotNewsBot/0.1 (+https://example.com)"
    },
    next: {
      revalidate: 0
    }
  });

  if (!response.ok) {
    throw new Error(`Fetch failed with ${response.status}`);
  }

  return response.text();
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function ingestSources({
  db,
  fetchText = defaultFetchText
}: {
  db: IngestDb;
  fetchText?: (url: string) => Promise<string>;
}): Promise<IngestResult> {
  const result: IngestResult = {
    processed: 0,
    created: 0,
    skipped: 0,
    failed: 0
  };

  const sources = await db.listEnabledSources();

  for (const source of sources) {
    result.processed += 1;

    try {
      const xml = await fetchText(source.feedUrl);
      const items = parseFeed(xml);

      for (const item of items) {
        const canonicalUrl = canonicalizeUrl(item.url);
        const created = await db.createCandidateIfNew({
          sourceId: source.id,
          title: item.title,
          url: item.url,
          canonicalUrlHash: hashCanonicalUrl(canonicalUrl),
          summary: item.summary,
          publishedAt: item.publishedAt,
          rawPayload: item.raw
        });

        if (created) {
          result.created += 1;
        } else {
          result.skipped += 1;
        }
      }

      await db.markSourceSuccess(source.id);
    } catch (error) {
      result.failed += 1;
      await db.markSourceFailure(source.id, errorMessage(error));
    }
  }

  return result;
}
```

- [ ] **Step 4: Verify ingestion tests**

Run:

```bash
npm run test -- src/lib/ingestion/fetch-sources.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Add real Drizzle ingestion adapter**

Modify `src/lib/ingestion/fetch-sources.ts` by adding:

```ts
import { eq } from "drizzle-orm";
import { db as defaultDb } from "@/db/client";
import { candidates, sources } from "@/db/schema";

export function createDrizzleIngestDb(db = defaultDb): IngestDb {
  return {
    async listEnabledSources() {
      return db
        .select({
          id: sources.id,
          name: sources.name,
          feedUrl: sources.feedUrl,
          category: sources.category
        })
        .from(sources)
        .where(eq(sources.enabled, true));
    },
    async createCandidateIfNew(candidate) {
      const inserted = await db
        .insert(candidates)
        .values(candidate)
        .onConflictDoNothing({
          target: candidates.canonicalUrlHash
        })
        .returning({ id: candidates.id });

      return inserted.length > 0;
    },
    async markSourceSuccess(sourceId) {
      await db
        .update(sources)
        .set({
          lastFetchedAt: new Date(),
          lastFetchStatus: "success",
          lastFetchError: null,
          updatedAt: new Date()
        })
        .where(eq(sources.id, sourceId));
    },
    async markSourceFailure(sourceId, message) {
      await db
        .update(sources)
        .set({
          lastFetchedAt: new Date(),
          lastFetchStatus: "failed",
          lastFetchError: message,
          updatedAt: new Date()
        })
        .where(eq(sources.id, sourceId));
    }
  };
}
```

- [ ] **Step 6: Verify all ingestion tests and typecheck through build**

Run:

```bash
npm run test -- src/lib/ingestion
npm run build
```

Expected: tests pass; build passes after environment variables are provided locally through `.env.local`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/ingestion/fetch-sources.ts src/lib/ingestion/fetch-sources.test.ts
git commit -m "feat: add source ingestion service"
```

---

### Task 5: Add Administrator Authentication and Guards

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/server/actions/auth.ts`
- Create: `scripts/hash-password.ts`
- Create: `src/lib/auth.test.ts`

- [ ] **Step 1: Write admin credential tests**

Create `src/lib/auth.test.ts`:

```ts
import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";
import { isAllowedAdmin, verifyAdminPassword } from "./auth";

describe("admin auth helpers", () => {
  it("allows only the configured administrator email", () => {
    expect(isAllowedAdmin("admin@example.com", "admin@example.com")).toBe(true);
    expect(isAllowedAdmin("other@example.com", "admin@example.com")).toBe(false);
  });

  it("verifies a bcrypt password hash", async () => {
    const hash = await bcrypt.hash("correct-password", 10);
    await expect(verifyAdminPassword("correct-password", hash)).resolves.toBe(true);
    await expect(verifyAdminPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
```

- [ ] **Step 2: Run auth tests to verify failure**

Run:

```bash
npm run test -- src/lib/auth.test.ts
```

Expected: FAIL because `auth.ts` does not exist.

- [ ] **Step 3: Implement Auth.js configuration and helpers**

Create `src/lib/auth.ts`:

```ts
import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { env } from "./env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export function isAllowedAdmin(email: string, adminEmail: string): boolean {
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
}

export async function verifyAdminPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/admin/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        if (!isAllowedAdmin(email, env.ADMIN_EMAIL)) return null;

        const valid = await verifyAdminPassword(password, env.ADMIN_PASSWORD_HASH);
        if (!valid) return null;

        return {
          id: "admin",
          email: env.ADMIN_EMAIL,
          name: "Administrator"
        };
      }
    })
  ],
  callbacks: {
    authorized({ auth, request }) {
      if (request.nextUrl.pathname.startsWith("/admin/login")) return true;
      if (request.nextUrl.pathname.startsWith("/admin")) return Boolean(auth?.user?.email);
      return true;
    }
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

Create `src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 4: Implement login action and page**

Create `src/server/actions/auth.ts`:

```ts
"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=CredentialsSignin");
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/admin/login"
  });
}
```

Create `src/app/admin/login/page.tsx`:

```tsx
import { loginAction } from "@/server/actions/auth";

export default function AdminLoginPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <form action={loginAction} className="w-full max-w-sm border border-line bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">管理员登录</h1>
        {searchParams.error ? <p className="mt-3 text-sm text-red-700">邮箱或密码不正确。</p> : null}
        <label className="mt-6 block text-sm font-medium text-neutral-700">
          邮箱
          <input name="email" type="email" required className="mt-2 w-full border border-line px-3 py-2" />
        </label>
        <label className="mt-4 block text-sm font-medium text-neutral-700">
          密码
          <input name="password" type="password" required className="mt-2 w-full border border-line px-3 py-2" />
        </label>
        <button type="submit" className="mt-6 w-full bg-ink px-4 py-2 text-white">
          登录
        </button>
      </form>
    </main>
  );
}
```

Create `scripts/hash-password.ts`:

```ts
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run admin:password -- <password>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
console.log(hash);
```

- [ ] **Step 5: Verify auth helpers**

Run:

```bash
npm run test -- src/lib/auth.test.ts
npm run admin:password -- "change-me-before-deploy"
```

Expected: tests pass; password hash command prints a bcrypt hash.

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth.ts src/lib/auth.test.ts src/app/api/auth src/app/admin/login src/server/actions/auth.ts scripts/hash-password.ts
git commit -m "feat: add admin authentication"
```

---

### Task 6: Build Admin Source Management and Manual Fetch

**Files:**
- Create: `src/db/queries/admin-sources.ts`
- Create: `src/server/actions/sources.ts`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/sources/page.tsx`
- Create: `src/app/api/cron/fetch/route.ts`
- Create: `src/server/actions/sources.test.ts`

- [ ] **Step 1: Write source form validation tests**

Create `src/server/actions/sources.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseSourceForm } from "./sources";

describe("parseSourceForm", () => {
  it("parses a valid source form", () => {
    const form = new FormData();
    form.set("name", "OpenAI");
    form.set("homepageUrl", "https://openai.com/news");
    form.set("feedUrl", "https://openai.com/news/rss.xml");
    form.set("category", "models");
    form.set("enabled", "on");

    expect(parseSourceForm(form)).toMatchObject({
      name: "OpenAI",
      category: "models",
      enabled: true
    });
  });

  it("rejects unsupported categories", () => {
    const form = new FormData();
    form.set("name", "Bad");
    form.set("homepageUrl", "https://example.com");
    form.set("feedUrl", "https://example.com/feed.xml");
    form.set("category", "other");

    expect(() => parseSourceForm(form)).toThrow();
  });
});
```

- [ ] **Step 2: Implement admin source queries**

Create `src/db/queries/admin-sources.ts`:

```ts
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { sources } from "@/db/schema";

export async function listAdminSources() {
  return db.select().from(sources).orderBy(desc(sources.createdAt));
}

export async function createSource(input: {
  name: string;
  homepageUrl: string;
  feedUrl: string;
  category: "models" | "tools";
  enabled: boolean;
}) {
  const [source] = await db.insert(sources).values(input).returning();
  return source;
}

export async function setSourceEnabled(id: string, enabled: boolean) {
  await db.update(sources).set({ enabled, updatedAt: new Date() }).where(eq(sources.id, id));
}
```

- [ ] **Step 3: Implement source server actions**

Create `src/server/actions/sources.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createSource } from "@/db/queries/admin-sources";
import { createDrizzleIngestDb, ingestSources } from "@/lib/ingestion/fetch-sources";

const sourceSchema = z.object({
  name: z.string().min(1),
  homepageUrl: z.string().url(),
  feedUrl: z.string().url(),
  category: z.enum(["models", "tools"]),
  enabled: z.boolean()
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
}

export function parseSourceForm(formData: FormData) {
  return sourceSchema.parse({
    name: formData.get("name"),
    homepageUrl: formData.get("homepageUrl"),
    feedUrl: formData.get("feedUrl"),
    category: formData.get("category"),
    enabled: formData.get("enabled") === "on"
  });
}

export async function createSourceAction(formData: FormData) {
  await requireAdmin();
  const input = parseSourceForm(formData);
  await createSource(input);
  revalidatePath("/admin/sources");
  revalidatePath("/sources");
}

export async function fetchSourcesAction() {
  await requireAdmin();
  const result = await ingestSources({ db: createDrizzleIngestDb() });
  revalidatePath("/admin");
  revalidatePath("/admin/candidates");
  revalidatePath("/admin/sources");
  return result;
}
```

- [ ] **Step 4: Implement admin dashboard and source page**

Create `src/app/admin/page.tsx`:

```tsx
import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-3xl font-semibold text-ink">管理后台</h1>
      <nav className="mt-6 grid gap-3 md:grid-cols-4">
        <Link className="border border-line bg-white p-4" href="/admin/sources">来源管理</Link>
        <Link className="border border-line bg-white p-4" href="/admin/candidates">候选审核</Link>
        <Link className="border border-line bg-white p-4" href="/admin/articles">文章管理</Link>
        <Link className="border border-line bg-white p-4" href="/admin/settings">设置</Link>
      </nav>
    </main>
  );
}
```

Create `src/app/admin/sources/page.tsx`:

```tsx
import { listAdminSources } from "@/db/queries/admin-sources";
import { createSourceAction, fetchSourcesAction } from "@/server/actions/sources";

export default async function AdminSourcesPage() {
  const sources = await listAdminSources();

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-ink">来源管理</h1>
        <form action={fetchSourcesAction}>
          <button className="bg-ink px-4 py-2 text-white" type="submit">手动抓取</button>
        </form>
      </div>

      <form action={createSourceAction} className="mt-8 grid gap-4 border border-line bg-white p-4 md:grid-cols-2">
        <input name="name" required placeholder="来源名称" className="border border-line px-3 py-2" />
        <input name="homepageUrl" required type="url" placeholder="主页 URL" className="border border-line px-3 py-2" />
        <input name="feedUrl" required type="url" placeholder="RSS/Atom URL" className="border border-line px-3 py-2 md:col-span-2" />
        <select name="category" required className="border border-line px-3 py-2">
          <option value="models">产品/模型动态</option>
          <option value="tools">AI 工具推荐</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input name="enabled" type="checkbox" defaultChecked />
          启用
        </label>
        <button className="bg-signal px-4 py-2 text-white md:col-span-2" type="submit">添加来源</button>
      </form>

      <section className="mt-8 divide-y divide-line border border-line bg-white">
        {sources.map((source) => (
          <article key={source.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-ink">{source.name}</h2>
                <p className="mt-1 text-sm text-neutral-600">{source.feedUrl}</p>
                <p className="mt-1 text-sm text-neutral-500">状态：{source.lastFetchStatus}</p>
              </div>
              <span className="text-sm">{source.enabled ? "启用" : "停用"}</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Implement protected cron route**

Create `src/app/api/cron/fetch/route.ts`:

```ts
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createDrizzleIngestDb, ingestSources } from "@/lib/ingestion/fetch-sources";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await ingestSources({ db: createDrizzleIngestDb() });
  return NextResponse.json(result);
}
```

- [ ] **Step 6: Verify source tests and build**

Run:

```bash
npm run test -- src/server/actions/sources.test.ts
npm run build
```

Expected: tests pass; build passes.

- [ ] **Step 7: Commit**

```bash
git add src/db/queries/admin-sources.ts src/server/actions/sources.ts src/server/actions/sources.test.ts src/app/admin src/app/api/cron/fetch/route.ts
git commit -m "feat: add source management"
```

---

### Task 7: Build Candidate Review and Article Publishing

**Files:**
- Create: `src/db/queries/admin-candidates.ts`
- Create: `src/db/queries/admin-articles.ts`
- Create: `src/server/actions/candidates.ts`
- Create: `src/server/actions/candidates.test.ts`
- Create: `src/app/admin/candidates/page.tsx`
- Create: `src/app/admin/articles/page.tsx`

- [ ] **Step 1: Write candidate publish validation tests**

Create `src/server/actions/candidates.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parsePublishCandidateForm } from "./candidates";

describe("parsePublishCandidateForm", () => {
  it("parses publish form values", () => {
    const form = new FormData();
    form.set("candidateId", "11111111-1111-1111-1111-111111111111");
    form.set("title", "Model update");
    form.set("summary", "Useful summary");
    form.set("category", "models");
    form.set("tags", "OpenAI, models");
    form.set("featured", "on");

    expect(parsePublishCandidateForm(form)).toMatchObject({
      title: "Model update",
      category: "models",
      tags: ["OpenAI", "models"],
      featured: true
    });
  });
});
```

- [ ] **Step 2: Implement candidate and article queries**

Create `src/db/queries/admin-candidates.ts`:

```ts
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { candidates, sources } from "@/db/schema";

export async function listNewCandidates() {
  return db
    .select({
      candidate: candidates,
      source: sources
    })
    .from(candidates)
    .innerJoin(sources, eq(candidates.sourceId, sources.id))
    .where(eq(candidates.status, "new"))
    .orderBy(desc(candidates.fetchedAt));
}

export async function markCandidateIgnored(id: string) {
  await db.update(candidates).set({ status: "ignored", updatedAt: new Date() }).where(eq(candidates.id, id));
}
```

Create `src/db/queries/admin-articles.ts`:

```ts
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { articles, articleTags, candidates, tags } from "@/db/schema";
import { createSlug } from "@/lib/slug";

export async function listAdminArticles() {
  return db.select().from(articles).orderBy(desc(articles.publishedAt));
}

export async function publishCandidate(input: {
  candidateId: string;
  sourceId: string;
  title: string;
  summary: string;
  url: string;
  category: "models" | "tools";
  featured: boolean;
  tags: string[];
}) {
  return db.transaction(async (tx) => {
    const [article] = await tx
      .insert(articles)
      .values({
        candidateId: input.candidateId,
        sourceId: input.sourceId,
        slug: `${createSlug(input.title)}-${Date.now()}`,
        title: input.title,
        summary: input.summary,
        url: input.url,
        category: input.category,
        featured: input.featured,
        status: "published"
      })
      .returning();

    for (const tagName of input.tags) {
      const slug = createSlug(tagName);
      const [tag] = await tx
        .insert(tags)
        .values({ name: tagName, slug })
        .onConflictDoUpdate({
          target: tags.slug,
          set: { name: tagName }
        })
        .returning();

      await tx
        .insert(articleTags)
        .values({ articleId: article.id, tagId: tag.id })
        .onConflictDoNothing({
          target: [articleTags.articleId, articleTags.tagId]
        });
    }

    await tx.update(candidates).set({ status: "published", updatedAt: new Date() }).where(eq(candidates.id, input.candidateId));
    return article;
  });
}
```

- [ ] **Step 3: Implement candidate server actions**

Create `src/server/actions/candidates.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { candidates } from "@/db/schema";
import { publishCandidate } from "@/db/queries/admin-articles";
import { markCandidateIgnored } from "@/db/queries/admin-candidates";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

const publishSchema = z.object({
  candidateId: z.string().uuid(),
  title: z.string().min(1),
  summary: z.string().min(1),
  category: z.enum(["models", "tools"]),
  tags: z.array(z.string().min(1)),
  featured: z.boolean()
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
}

export function parsePublishCandidateForm(formData: FormData) {
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return publishSchema.parse({
    candidateId: formData.get("candidateId"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    category: formData.get("category"),
    tags,
    featured: formData.get("featured") === "on"
  });
}

export async function publishCandidateAction(formData: FormData) {
  await requireAdmin();
  const input = parsePublishCandidateForm(formData);
  const [candidate] = await db.select().from(candidates).where(eq(candidates.id, input.candidateId));
  if (!candidate) throw new Error("Candidate not found");

  await publishCandidate({
    candidateId: candidate.id,
    sourceId: candidate.sourceId,
    title: input.title,
    summary: input.summary,
    url: candidate.url,
    category: input.category,
    featured: input.featured,
    tags: input.tags
  });

  revalidatePath("/");
  revalidatePath("/admin/candidates");
  revalidatePath("/admin/articles");
}

export async function ignoreCandidateAction(formData: FormData) {
  await requireAdmin();
  const candidateId = z.string().uuid().parse(formData.get("candidateId"));
  await markCandidateIgnored(candidateId);
  revalidatePath("/admin/candidates");
}
```

- [ ] **Step 4: Implement candidate and article admin pages**

Create `src/app/admin/candidates/page.tsx`:

```tsx
import { listNewCandidates } from "@/db/queries/admin-candidates";
import { ignoreCandidateAction, publishCandidateAction } from "@/server/actions/candidates";

export default async function AdminCandidatesPage() {
  const rows = await listNewCandidates();

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-3xl font-semibold text-ink">候选审核</h1>
      <section className="mt-8 grid gap-4">
        {rows.map(({ candidate, source }) => (
          <article key={candidate.id} className="border border-line bg-white p-4">
            <p className="text-sm text-neutral-500">{source.name}</p>
            <h2 className="mt-2 text-xl font-semibold">{candidate.title}</h2>
            <p className="mt-2 text-sm text-neutral-700">{candidate.summary}</p>
            <a className="mt-2 inline-block text-sm text-signal" href={candidate.url} target="_blank">原文链接</a>
            <form action={publishCandidateAction} className="mt-4 grid gap-3 md:grid-cols-2">
              <input type="hidden" name="candidateId" value={candidate.id} />
              <input name="title" defaultValue={candidate.title} className="border border-line px-3 py-2" />
              <input name="tags" placeholder="标签，用英文逗号分隔" className="border border-line px-3 py-2" />
              <textarea name="summary" defaultValue={candidate.summary ?? ""} className="border border-line px-3 py-2 md:col-span-2" />
              <select name="category" defaultValue={source.category} className="border border-line px-3 py-2">
                <option value="models">产品/模型动态</option>
                <option value="tools">AI 工具推荐</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input name="featured" type="checkbox" />
                精选
              </label>
              <button className="bg-signal px-4 py-2 text-white md:col-span-2" type="submit">发布</button>
            </form>
            <form action={ignoreCandidateAction} className="mt-3">
              <input type="hidden" name="candidateId" value={candidate.id} />
              <button className="text-sm text-neutral-500" type="submit">忽略</button>
            </form>
          </article>
        ))}
      </section>
    </main>
  );
}
```

Create `src/app/admin/articles/page.tsx`:

```tsx
import { listAdminArticles } from "@/db/queries/admin-articles";

export default async function AdminArticlesPage() {
  const articles = await listAdminArticles();

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-3xl font-semibold text-ink">文章管理</h1>
      <section className="mt-8 divide-y divide-line border border-line bg-white">
        {articles.map((article) => (
          <article key={article.id} className="p-4">
            <h2 className="font-semibold">{article.title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{article.summary}</p>
            <p className="mt-2 text-xs text-neutral-500">状态：{article.status}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Verify candidate tests and build**

Run:

```bash
npm run test -- src/server/actions/candidates.test.ts
npm run build
```

Expected: tests pass; build passes.

- [ ] **Step 6: Commit**

```bash
git add src/db/queries/admin-candidates.ts src/db/queries/admin-articles.ts src/server/actions/candidates.ts src/server/actions/candidates.test.ts src/app/admin/candidates src/app/admin/articles
git commit -m "feat: add candidate publishing workflow"
```

---

### Task 8: Build Public News Pages

**Files:**
- Create: `src/db/queries/public-articles.ts`
- Create: `src/db/queries/public-sources.ts`
- Create: `src/components/public/article-card.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/category/[category]/page.tsx`
- Create: `src/app/search/page.tsx`
- Create: `src/app/sources/page.tsx`
- Create: `src/app/article/[slug]/page.tsx`

- [ ] **Step 1: Implement public article queries**

Create `src/db/queries/public-articles.ts`:

```ts
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db/client";
import { articles, sources } from "@/db/schema";

export async function listPublishedArticles(limit = 30) {
  return db
    .select({ article: articles, source: sources })
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function listPublishedArticlesByCategory(category: "models" | "tools") {
  return db
    .select({ article: articles, source: sources })
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .where(and(eq(articles.status, "published"), eq(articles.category, category)))
    .orderBy(desc(articles.publishedAt))
    .limit(50);
}

export async function searchPublishedArticles(query: string) {
  const pattern = `%${query}%`;
  return db
    .select({ article: articles, source: sources })
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .where(and(eq(articles.status, "published"), or(ilike(articles.title, pattern), ilike(articles.summary, pattern))))
    .orderBy(desc(articles.publishedAt))
    .limit(50);
}

export async function getPublishedArticleBySlug(slug: string) {
  const [row] = await db
    .select({ article: articles, source: sources })
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .where(and(eq(articles.status, "published"), eq(articles.slug, slug)))
    .limit(1);
  return row ?? null;
}
```

Create `src/db/queries/public-sources.ts`:

```ts
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { sources } from "@/db/schema";

export async function listPublicSources() {
  return db.select().from(sources).where(eq(sources.enabled, true)).orderBy(asc(sources.name));
}
```

- [ ] **Step 2: Create article card component**

Create `src/components/public/article-card.tsx`:

```tsx
import Link from "next/link";

export function ArticleCard({
  article,
  sourceName
}: {
  article: {
    slug: string;
    title: string;
    summary: string;
    url: string;
    category: "models" | "tools";
    featured: boolean;
    publishedAt: Date;
  };
  sourceName: string;
}) {
  return (
    <article className="border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-4 text-xs text-neutral-500">
        <span>{sourceName}</span>
        <span>{article.category === "models" ? "产品/模型" : "工具"}</span>
      </div>
      <h2 className="mt-3 text-xl font-semibold text-ink">
        <Link href={`/article/${article.slug}`}>{article.title}</Link>
      </h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-700">{article.summary}</p>
      <div className="mt-4 flex items-center justify-between gap-4 text-sm">
        <a className="text-signal" href={article.url} target="_blank" rel="noreferrer">原文</a>
        {article.featured ? <span className="text-mint">精选</span> : null}
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Replace homepage with live data**

Modify `src/app/page.tsx`:

```tsx
import Link from "next/link";
import { ArticleCard } from "@/components/public/article-card";
import { listPublishedArticles } from "@/db/queries/public-articles";

export default async function HomePage() {
  const rows = await listPublishedArticles();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
      <header className="border-b border-line pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-mint">AI Hot News</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">AI 热点新闻</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-700">
          聚合全球 AI 产品、模型动态和实用工具推荐。
        </p>
        <nav className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link className="border border-line bg-white px-3 py-2" href="/category/models">产品/模型动态</Link>
          <Link className="border border-line bg-white px-3 py-2" href="/category/tools">AI 工具推荐</Link>
          <Link className="border border-line bg-white px-3 py-2" href="/sources">来源</Link>
          <Link className="border border-line bg-white px-3 py-2" href="/search">搜索</Link>
        </nav>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {rows.length > 0 ? (
          rows.map(({ article, source }) => <ArticleCard key={article.id} article={article} sourceName={source.name} />)
        ) : (
          <p className="text-neutral-600">还没有已发布文章。</p>
        )}
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Implement category, search, sources, and article pages**

Create `src/app/category/[category]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/public/article-card";
import { listPublishedArticlesByCategory } from "@/db/queries/public-articles";

const titles = {
  models: "全球 AI 产品和模型动态",
  tools: "AI 工具推荐"
};

export default async function CategoryPage({ params }: { params: { category: string } }) {
  if (params.category !== "models" && params.category !== "tools") notFound();
  const rows = await listPublishedArticlesByCategory(params.category);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-3xl font-semibold text-ink">{titles[params.category]}</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {rows.map(({ article, source }) => <ArticleCard key={article.id} article={article} sourceName={source.name} />)}
      </section>
    </main>
  );
}
```

Create `src/app/search/page.tsx`:

```tsx
import { ArticleCard } from "@/components/public/article-card";
import { searchPublishedArticles } from "@/db/queries/public-articles";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.trim() ?? "";
  const rows = query ? await searchPublishedArticles(query) : [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-3xl font-semibold text-ink">搜索</h1>
      <form className="mt-6 flex gap-2">
        <input name="q" defaultValue={query} className="min-w-0 flex-1 border border-line px-3 py-2" placeholder="搜索标题或摘要" />
        <button className="bg-ink px-4 py-2 text-white" type="submit">搜索</button>
      </form>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {rows.map(({ article, source }) => <ArticleCard key={article.id} article={article} sourceName={source.name} />)}
      </section>
    </main>
  );
}
```

Create `src/app/sources/page.tsx`:

```tsx
import { listPublicSources } from "@/db/queries/public-sources";

export default async function SourcesPage() {
  const sources = await listPublicSources();

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-3xl font-semibold text-ink">来源</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {sources.map((source) => (
          <article key={source.id} className="border border-line bg-white p-4">
            <h2 className="font-semibold">{source.name}</h2>
            <a className="mt-2 block text-sm text-signal" href={source.homepageUrl} target="_blank" rel="noreferrer">
              {source.homepageUrl}
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
```

Create `src/app/article/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getPublishedArticleBySlug } from "@/db/queries/public-articles";

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const row = await getPublishedArticleBySlug(params.slug);
  if (!row) notFound();

  const { article, source } = row;

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <p className="text-sm text-neutral-500">{source.name}</p>
      <h1 className="mt-3 text-4xl font-semibold text-ink">{article.title}</h1>
      <p className="mt-6 text-lg leading-8 text-neutral-700">{article.summary}</p>
      <a className="mt-8 inline-block bg-ink px-4 py-2 text-white" href={article.url} target="_blank" rel="noreferrer">
        阅读原文
      </a>
    </main>
  );
}
```

- [ ] **Step 5: Verify build**

Run:

```bash
npm run build
```

Expected: build passes with local environment variables configured.

- [ ] **Step 6: Commit**

```bash
git add src/db/queries/public-articles.ts src/db/queries/public-sources.ts src/components/public src/app/page.tsx src/app/category src/app/search src/app/sources src/app/article
git commit -m "feat: add public news pages"
```

---

### Task 9: Add Vercel Cron, README, and End-to-End Manual Verification

**Files:**
- Create: `vercel.json`
- Create: `README.md`
- Modify: `.env.example`

- [ ] **Step 1: Add Vercel Cron configuration**

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch",
      "schedule": "0 */8 * * *"
    }
  ]
}
```

- [ ] **Step 2: Document local development and deployment**

Create `README.md`:

```md
# AI Hot News

AI Hot News is a semi-automated AI news aggregation website.

## Stack

- Next.js App Router
- Vercel
- Neon Postgres
- Drizzle ORM
- Auth.js / NextAuth Credentials login
- RSS/Atom ingestion

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
   npm run admin:password -- "your-password"
   ```

4. Fill `.env.local`.

5. Generate and run database migrations:

   ```bash
   npm run db:generate
   npm run db:migrate
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

## Vercel Deployment

Set these environment variables in Vercel:

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `CRON_SECRET`

Create a Neon Postgres project, add its connection string as `DATABASE_URL`, run migrations, and connect the GitHub repository to Vercel.

The cron route is `/api/cron/fetch` and expects:

```http
Authorization: Bearer <CRON_SECRET>
```
```

- [ ] **Step 3: Verify all tests and build**

Run:

```bash
npm run test
npm run build
```

Expected: all tests pass; production build passes.

- [ ] **Step 4: Run local app for manual check**

Run:

```bash
npm run dev
```

Expected: app starts on `http://localhost:3000` or the next available port.

Manual check:

- `/` renders without crashing.
- `/admin/login` renders.
- `/admin/sources` requires login.
- after configuring real Neon credentials and running migrations, source creation and candidate publishing work.

- [ ] **Step 5: Commit**

```bash
git add vercel.json README.md .env.example
git commit -m "docs: add deployment instructions"
```

---

## Self-Review

Spec coverage:

- Public AI news website: Task 8.
- Administrator-only source management: Tasks 5 and 6.
- RSS/Atom candidate ingestion: Tasks 3, 4, and 6.
- Candidate review and publication: Task 7.
- Published article management: Task 7.
- Category and tag filtering: Tasks 7 and 8.
- Search over published articles: Task 8.
- Vercel deployment: Task 9.
- Neon schema and migrations: Task 2.
- Manual fetch trigger: Task 6.
- Protected cron endpoint: Tasks 6 and 9.

Known execution notes:

- `npm install` requires network access.
- `npm run build` requires local environment variables because `src/lib/env.ts` validates at import time.
- Database migrations require a real Neon `DATABASE_URL`.
- The first implementation should keep AI summaries out of scope.

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

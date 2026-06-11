import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db/client";
import { articles, sources } from "@/db/schema";

export type PublicArticle = Awaited<ReturnType<typeof listPublishedArticles>>[number];

const publicArticleColumns = {
  id: articles.id,
  slug: articles.slug,
  title: articles.title,
  summary: articles.summary,
  url: articles.url,
  category: articles.category,
  featured: articles.featured,
  viewCount: articles.viewCount,
  publishedAt: articles.publishedAt,
  source: {
    id: sources.id,
    name: sources.name,
    homepageUrl: sources.homepageUrl,
    category: sources.category
  }
};

export async function listPublishedArticles(limit = 30) {
  return db
    .select(publicArticleColumns)
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function listPublishedArticlesByCategory(category: "models" | "tools") {
  return db
    .select(publicArticleColumns)
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .where(and(eq(articles.status, "published"), eq(articles.category, category)))
    .orderBy(desc(articles.publishedAt));
}

export async function searchPublishedArticles(query: string) {
  const term = query.trim();

  if (!term) {
    return [];
  }

  return db
    .select(publicArticleColumns)
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .where(
      and(
        eq(articles.status, "published"),
        or(ilike(articles.title, `%${term}%`), ilike(articles.summary, `%${term}%`))
      )
    )
    .orderBy(desc(articles.publishedAt));
}

export async function getPublishedArticleBySlug(slug: string) {
  const [article] = await db
    .select(publicArticleColumns)
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .where(and(eq(articles.status, "published"), eq(articles.slug, slug)))
    .limit(1);

  return article ?? null;
}

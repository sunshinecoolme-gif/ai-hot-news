import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { articleTags, articles, candidates, tags } from "@/db/schema";
import { createSlug } from "@/lib/slug";

export async function listAdminArticles() {
  return db.select().from(articles).orderBy(desc(articles.publishedAt));
}

export type PublishCandidateInput = {
  candidateId: string;
  sourceId: string;
  title: string;
  summary: string;
  url: string;
  category: "models" | "tools";
  tags: string[];
  featured: boolean;
};

export async function publishCandidate(input: PublishCandidateInput) {
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
        featured: input.featured
      })
      .returning();

    const tagValues = input.tags.map((name) => ({
      name,
      slug: createSlug(name)
    }));

    if (tagValues.length > 0) {
      const upsertedTags = await tx
        .insert(tags)
        .values(tagValues)
        .onConflictDoUpdate({
          target: tags.slug,
          set: {
            name: sql`excluded.name`
          }
        })
        .returning();

      await tx
        .insert(articleTags)
        .values(upsertedTags.map((tag) => ({ articleId: article.id, tagId: tag.id })))
        .onConflictDoNothing();
    }

    await tx
      .update(candidates)
      .set({
        status: "published",
        updatedAt: new Date()
      })
      .where(eq(candidates.id, input.candidateId));

    return article;
  });
}

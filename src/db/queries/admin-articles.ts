import { and, desc, eq, sql } from "drizzle-orm";
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
    const [claimedCandidate] = await tx
      .update(candidates)
      .set({
        status: "published",
        updatedAt: new Date()
      })
      .where(and(eq(candidates.id, input.candidateId), eq(candidates.status, "new")))
      .returning({ id: candidates.id });

    if (!claimedCandidate) {
      throw new Error("Candidate is not publishable");
    }

    const [article] = await tx
      .insert(articles)
      .values({
        candidateId: input.candidateId,
        sourceId: input.sourceId,
        slug: `${createSlug(input.title)}-${input.candidateId.slice(0, 8)}`,
        title: input.title,
        summary: input.summary,
        url: input.url,
        category: input.category,
        featured: input.featured
      })
      .returning();

    const tagValues = Array.from(
      input.tags
        .reduce((deduped, name) => {
          const slug = createSlug(name);
          if (!deduped.has(slug)) {
            deduped.set(slug, { name, slug });
          }
          return deduped;
        }, new Map<string, { name: string; slug: string }>())
        .values()
    );

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

    return article;
  });
}

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { candidates, sources } from "@/db/schema";
import { normalizeFeedText } from "@/lib/ingestion/feed-parser";

export async function listNewCandidates() {
  const rows = await db
    .select({
      candidate: candidates,
      source: sources
    })
    .from(candidates)
    .innerJoin(sources, eq(candidates.sourceId, sources.id))
    .where(eq(candidates.status, "new"))
    .orderBy(desc(candidates.fetchedAt));

  return rows.map(({ candidate, source }) => ({
    candidate: {
      ...candidate,
      title: normalizeFeedText(candidate.title) ?? candidate.title,
      summary: normalizeFeedText(candidate.summary)
    },
    source
  }));
}

export async function markCandidateIgnored(id: string) {
  await db
    .update(candidates)
    .set({
      status: "ignored",
      updatedAt: new Date()
    })
    .where(and(eq(candidates.id, id), eq(candidates.status, "new")));
}

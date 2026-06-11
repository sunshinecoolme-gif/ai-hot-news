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
  await db
    .update(candidates)
    .set({
      status: "ignored",
      updatedAt: new Date()
    })
    .where(eq(candidates.id, id));
}

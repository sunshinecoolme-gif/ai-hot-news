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
  await db
    .update(sources)
    .set({
      enabled,
      updatedAt: new Date()
    })
    .where(eq(sources.id, id));
}

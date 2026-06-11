import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { sources } from "@/db/schema";

export async function listPublicSources() {
  return db.select().from(sources).where(eq(sources.enabled, true)).orderBy(asc(sources.name));
}

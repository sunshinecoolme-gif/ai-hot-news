import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { candidates } from "@/db/schema";
import { normalizeFeedText } from "@/lib/ingestion/feed-parser";
import { createSlug } from "@/lib/slug";

const publishCandidateSchema = z.object({
  candidateId: z.string().uuid(),
  title: z.string().min(1),
  summary: z.string().min(1),
  category: z.enum(["models", "tools"]),
  tags: z.array(z.string().min(1)),
  featured: z.boolean()
});

const candidateIdSchema = z.string().uuid();

async function requireAdmin() {
  const { isAllowedAdmin } = await import("@/lib/admin");
  const { auth } = await import("@/lib/auth");
  const { env } = await import("@/lib/env");
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !isAllowedAdmin(email, env.ADMIN_EMAIL)) {
    throw new Error("Unauthorized");
  }
}

export function parsePublishCandidateForm(formData: FormData) {
  const tagsValue = formData.get("tags");
  const tags =
    typeof tagsValue === "string"
      ? Array.from(
          tagsValue
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .reduce((deduped, tag) => {
              const slug = createSlug(tag);
              if (!deduped.has(slug)) {
                deduped.set(slug, tag);
              }
              return deduped;
            }, new Map<string, string>())
            .values()
        )
      : [];

  return publishCandidateSchema.parse({
    candidateId: formData.get("candidateId"),
    title: normalizeFeedText(formData.get("title")),
    summary: normalizeFeedText(formData.get("summary")),
    category: formData.get("category"),
    tags,
    featured: formData.get("featured") === "on"
  });
}

export async function publishCandidateAction(formData: FormData) {
  "use server";

  await requireAdmin();

  const { publishCandidate } = await import("@/db/queries/admin-articles");
  const input = parsePublishCandidateForm(formData);
  const [candidate] = await db.select().from(candidates).where(eq(candidates.id, input.candidateId)).limit(1);

  if (!candidate) {
    throw new Error("Candidate not found");
  }

  if (candidate.status !== "new") {
    throw new Error("Candidate is not publishable");
  }

  await publishCandidate({
    ...input,
    sourceId: candidate.sourceId,
    url: candidate.url
  });

  revalidatePath("/");
  revalidatePath("/admin/candidates");
  revalidatePath("/admin/articles");
}

export async function ignoreCandidateAction(formData: FormData) {
  "use server";

  await requireAdmin();

  const { markCandidateIgnored } = await import("@/db/queries/admin-candidates");
  const candidateId = candidateIdSchema.parse(formData.get("candidateId"));
  await markCandidateIgnored(candidateId);

  revalidatePath("/admin/candidates");
}

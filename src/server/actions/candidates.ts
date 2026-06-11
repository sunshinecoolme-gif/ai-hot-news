import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { candidates } from "@/db/schema";

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
          new Set(
            tagsValue
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          )
        )
      : [];

  return publishCandidateSchema.parse({
    candidateId: formData.get("candidateId"),
    title: formData.get("title"),
    summary: formData.get("summary"),
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

import { revalidatePath } from "next/cache";
import { z } from "zod";

const sourceSchema = z.object({
  name: z.string().min(1),
  homepageUrl: z.string().url(),
  feedUrl: z.string().url(),
  category: z.enum(["models", "tools"]),
  enabled: z.boolean()
});

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

export function parseSourceForm(formData: FormData) {
  return sourceSchema.parse({
    name: formData.get("name"),
    homepageUrl: formData.get("homepageUrl"),
    feedUrl: formData.get("feedUrl"),
    category: formData.get("category"),
    enabled: formData.get("enabled") === "on"
  });
}

export async function createSourceAction(formData: FormData) {
  "use server";

  await requireAdmin();

  const { createSource } = await import("@/db/queries/admin-sources");
  const input = parseSourceForm(formData);
  await createSource(input);

  revalidatePath("/admin/sources");
  revalidatePath("/sources");
}

export async function fetchSourcesAction() {
  "use server";

  await requireAdmin();

  const { createDrizzleIngestDb, ingestSources } = await import("@/lib/ingestion/fetch-sources");
  const result = await ingestSources({ db: createDrizzleIngestDb() });

  revalidatePath("/admin");
  revalidatePath("/admin/candidates");
  revalidatePath("/admin/sources");

  return result;
}

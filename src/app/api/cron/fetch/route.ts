import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createDrizzleIngestDb, ingestSources } from "@/lib/ingestion/fetch-sources";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await ingestSources({ db: createDrizzleIngestDb() });

  return NextResponse.json(result);
}

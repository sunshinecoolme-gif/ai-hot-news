import { eq } from "drizzle-orm";
import { db as defaultDb } from "@/db/client";
import { candidates, sources } from "@/db/schema";
import { canonicalizeUrl, hashCanonicalUrl } from "./canonical-url";
import { parseFeed } from "./feed-parser";

export type SourceForIngest = {
  id: string;
  feedUrl: string;
};

export type CandidateInput = {
  sourceId: string;
  title: string;
  url: string;
  canonicalUrl: string;
  canonicalUrlHash: string;
  summary: string | null;
  publishedAt: Date | null;
  rawPayload: Record<string, unknown>;
};

export type IngestDb = {
  listEnabledSources(): Promise<SourceForIngest[]>;
  createCandidateIfNew(candidate: CandidateInput): Promise<boolean>;
  markSourceSuccess(sourceId: string): Promise<void>;
  markSourceFailure(sourceId: string, error: string): Promise<void>;
};

export type IngestResult = {
  processed: number;
  created: number;
  skipped: number;
  failed: number;
};

const DEFAULT_FETCH_TIMEOUT_MS = 15_000;

export async function defaultFetchText(url: string, timeoutMs = DEFAULT_FETCH_TIMEOUT_MS): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "AIHotNewsBot/0.1 (+https://example.com)"
      },
      signal: controller.signal,
      next: { revalidate: 0 }
    } as RequestInit & { next: { revalidate: number } });

    if (!response.ok) {
      throw new Error(`Fetch failed with ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}

export async function ingestSources({
  db,
  fetchText = defaultFetchText
}: {
  db: IngestDb;
  fetchText?: (url: string) => Promise<string>;
}): Promise<IngestResult> {
  const result: IngestResult = {
    processed: 0,
    created: 0,
    skipped: 0,
    failed: 0
  };

  const enabledSources = await db.listEnabledSources();

  for (const source of enabledSources) {
    result.processed += 1;

    try {
      const xml = await fetchText(source.feedUrl);
      const items = parseFeed(xml);

      for (const item of items) {
        try {
          const canonicalUrl = canonicalizeUrl(item.url);
          const created = await db.createCandidateIfNew({
            sourceId: source.id,
            title: item.title,
            url: item.url,
            canonicalUrl,
            canonicalUrlHash: hashCanonicalUrl(canonicalUrl),
            summary: item.summary,
            publishedAt: item.publishedAt,
            rawPayload: item.raw
          });

          if (created) {
            result.created += 1;
          } else {
            result.skipped += 1;
          }
        } catch {
          result.skipped += 1;
        }
      }

      await db.markSourceSuccess(source.id);
    } catch (error) {
      result.failed += 1;
      await db.markSourceFailure(source.id, errorMessage(error));
    }
  }

  return result;
}

export function createDrizzleIngestDb(db = defaultDb): IngestDb {
  return {
    async listEnabledSources() {
      return db
        .select({
          id: sources.id,
          feedUrl: sources.feedUrl
        })
        .from(sources)
        .where(eq(sources.enabled, true));
    },
    async createCandidateIfNew(candidate) {
      const inserted = await db
        .insert(candidates)
        .values({
          sourceId: candidate.sourceId,
          title: candidate.title,
          url: candidate.url,
          canonicalUrlHash: candidate.canonicalUrlHash,
          summary: candidate.summary,
          publishedAt: candidate.publishedAt,
          rawPayload: candidate.rawPayload
        })
        .onConflictDoNothing({ target: candidates.canonicalUrlHash })
        .returning({ id: candidates.id });

      return inserted.length > 0;
    },
    async markSourceSuccess(sourceId) {
      const now = new Date();

      await db
        .update(sources)
        .set({
          lastFetchedAt: now,
          lastFetchStatus: "success",
          lastFetchError: null,
          updatedAt: now
        })
        .where(eq(sources.id, sourceId));
    },
    async markSourceFailure(sourceId, error) {
      const now = new Date();

      await db
        .update(sources)
        .set({
          lastFetchedAt: now,
          lastFetchStatus: "failed",
          lastFetchError: error,
          updatedAt: now
        })
        .where(eq(sources.id, sourceId));
    }
  };
}

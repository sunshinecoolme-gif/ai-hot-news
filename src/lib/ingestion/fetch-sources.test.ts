import { describe, expect, it } from "vitest";
import { ingestSources, type CandidateInput, type IngestDb, type SourceForIngest } from "./fetch-sources";

function rssItem(title: string, url: string) {
  return `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <item>
          <title>${title}</title>
          <link>${url}</link>
          <description>Summary for ${title}</description>
          <pubDate>Wed, 10 Jun 2026 08:00:00 GMT</pubDate>
        </item>
      </channel>
    </rss>`;
}

function fakeDb(sources: SourceForIngest[], createResults: boolean[] = []) {
  const candidates: CandidateInput[] = [];
  const successes: string[] = [];
  const failures: Array<{ sourceId: string; error: string }> = [];

  const db: IngestDb = {
    async listEnabledSources() {
      return sources;
    },
    async createCandidateIfNew(candidate) {
      candidates.push(candidate);
      return createResults.length > 0 ? (createResults.shift() ?? false) : true;
    },
    async markSourceSuccess(sourceId) {
      successes.push(sourceId);
    },
    async markSourceFailure(sourceId, error) {
      failures.push({ sourceId, error });
    }
  };

  return { db, candidates, successes, failures };
}

describe("ingestSources", () => {
  it("creates candidates from enabled sources using injected fetchText and db", async () => {
    const source: SourceForIngest = {
      id: "source-1",
      feedUrl: "https://example.com/feed.xml"
    };
    const { db, candidates, successes, failures } = fakeDb([source]);

    const result = await ingestSources({
      db,
      async fetchText(url) {
        expect(url).toBe(source.feedUrl);
        return rssItem("New model", "https://Example.com/news/model?utm_source=rss&b=2&a=1");
      }
    });

    expect(result).toEqual({ processed: 1, created: 1, skipped: 0, failed: 0 });
    expect(successes).toEqual(["source-1"]);
    expect(failures).toEqual([]);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      sourceId: "source-1",
      title: "New model",
      url: "https://Example.com/news/model?utm_source=rss&b=2&a=1",
      canonicalUrl: "https://example.com/news/model?a=1&b=2",
      summary: "Summary for New model"
    });
    expect(candidates[0].canonicalUrlHash).toMatch(/^[a-f0-9]{64}$/);
    expect(candidates[0].publishedAt?.toISOString()).toBe("2026-06-10T08:00:00.000Z");
    expect(candidates[0].rawPayload).toMatchObject({ title: "New model" });
  });

  it("continues when one source fails and marks success for the good source", async () => {
    const sources: SourceForIngest[] = [
      { id: "bad-source", feedUrl: "https://example.com/bad.xml" },
      { id: "good-source", feedUrl: "https://example.com/good.xml" }
    ];
    const { db, candidates, successes, failures } = fakeDb(sources);

    const result = await ingestSources({
      db,
      async fetchText(url) {
        if (url.endsWith("/bad.xml")) {
          throw new Error("upstream unavailable");
        }
        return rssItem("Working feed", "https://example.com/working");
      }
    });

    expect(result).toEqual({ processed: 2, created: 1, skipped: 0, failed: 1 });
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      sourceId: "good-source",
      title: "Working feed"
    });
    expect(successes).toEqual(["good-source"]);
    expect(failures).toEqual([{ sourceId: "bad-source", error: "upstream unavailable" }]);
  });
});

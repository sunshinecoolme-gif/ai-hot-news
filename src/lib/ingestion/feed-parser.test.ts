import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFeed } from "./feed-parser";

function fixture(name: string) {
  return readFileSync(join(process.cwd(), "src/test/fixtures", name), "utf8");
}

describe("parseFeed", () => {
  it("parses RSS items", () => {
    const items = parseFeed(fixture("openai-rss.xml"));

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: "New model release",
      url: "https://openai.com/news/model?utm_source=rss",
      summary: "A short model update."
    });
    expect(items[0].publishedAt?.toISOString()).toBe("2026-06-10T08:00:00.000Z");
  });

  it("parses Atom entries", () => {
    const items = parseFeed(fixture("google-atom.xml"));

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: "Tool launch",
      url: "https://example.com/tools/launch?utm_campaign=feed",
      summary: "A practical AI tool launch."
    });
  });
});

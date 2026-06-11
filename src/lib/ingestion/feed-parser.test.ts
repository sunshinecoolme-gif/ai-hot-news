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

  it("prefers Atom alternate links over feed self links", () => {
    const items = parseFeed(`<?xml version="1.0" encoding="UTF-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <title>Model article</title>
          <link rel="self" href="https://example.com/feed/entry/1" />
          <link rel="alternate" href="https://example.com/articles/model" />
          <summary>Article summary.</summary>
          <updated>2026-06-10T09:30:00Z</updated>
        </entry>
      </feed>`);

    expect(items).toHaveLength(1);
    expect(items[0].url).toBe("https://example.com/articles/model");
  });

  it("returns no items when RSS channel is missing", () => {
    expect(parseFeed(`<rss version="2.0"></rss>`)).toEqual([]);
  });

  it("skips entries with malformed or relative URLs", () => {
    const items = parseFeed(`<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0">
        <channel>
          <item>
            <title>Bad relative URL</title>
            <link>/relative-path</link>
          </item>
          <item>
            <title>Bad protocol</title>
            <link>mailto:hello@example.com</link>
          </item>
        </channel>
      </rss>`);

    expect(items).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { parseSourceForm } from "./sources";

describe("parseSourceForm", () => {
  it("parses a valid source form", () => {
    const form = new FormData();
    form.set("name", "OpenAI");
    form.set("homepageUrl", "https://openai.com/news");
    form.set("feedUrl", "https://openai.com/news/rss.xml");
    form.set("category", "models");
    form.set("enabled", "on");

    expect(parseSourceForm(form)).toMatchObject({
      name: "OpenAI",
      category: "models",
      enabled: true
    });
  });

  it("rejects unsupported categories", () => {
    const form = new FormData();
    form.set("name", "Bad");
    form.set("homepageUrl", "https://example.com");
    form.set("feedUrl", "https://example.com/feed.xml");
    form.set("category", "other");

    expect(() => parseSourceForm(form)).toThrow();
  });
});

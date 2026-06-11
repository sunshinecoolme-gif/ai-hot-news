import { describe, expect, it } from "vitest";
import { parseSourceEnabledForm, parseSourceForm } from "./sources";

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

describe("parseSourceEnabledForm", () => {
  it("parses a source enabled toggle form", () => {
    const form = new FormData();
    form.set("sourceId", "2d7e5d38-3c6e-4a96-b59d-4ad26325fef7");
    form.set("enabled", "false");

    expect(parseSourceEnabledForm(form)).toEqual({
      sourceId: "2d7e5d38-3c6e-4a96-b59d-4ad26325fef7",
      enabled: false
    });
  });

  it("rejects an invalid source id", () => {
    const form = new FormData();
    form.set("sourceId", "not-a-uuid");
    form.set("enabled", "true");

    expect(() => parseSourceEnabledForm(form)).toThrow();
  });
});

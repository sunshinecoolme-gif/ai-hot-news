import { describe, expect, it } from "vitest";
import { canonicalizeUrl, hashCanonicalUrl } from "./canonical-url";

describe("canonicalizeUrl", () => {
  it("removes tracking parameters and normalizes host casing", () => {
    expect(canonicalizeUrl(" https://Example.com/Post?utm_source=x&id=42&utm_medium=email ")).toBe(
      "https://example.com/Post?id=42"
    );
  });

  it("removes a trailing slash from non-root paths", () => {
    expect(canonicalizeUrl("https://example.com/news/")).toBe("https://example.com/news");
  });
});

describe("hashCanonicalUrl", () => {
  it("returns the same hash for equivalent URLs", () => {
    expect(hashCanonicalUrl("https://example.com/a?utm_campaign=x")).toBe(hashCanonicalUrl("https://example.com/a"));
  });
});

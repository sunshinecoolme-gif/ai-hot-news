import { describe, expect, it } from "vitest";
import { createSlug } from "./slug";

describe("createSlug", () => {
  it("creates a lowercase URL-safe slug", () => {
    expect(createSlug("OpenAI Releases GPT-5.5!")).toBe("openai-releases-gpt-5-5");
  });

  it("falls back to news when input has no usable letters or numbers", () => {
    expect(createSlug("!!!")).toBe("news");
  });
});

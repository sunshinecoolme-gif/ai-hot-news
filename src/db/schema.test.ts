import { describe, expect, it } from "vitest";
import { articles, candidates, sources } from "./schema";

describe("database schema", () => {
  it("defines the core tables", () => {
    expect(sources).toBeDefined();
    expect(candidates).toBeDefined();
    expect(articles).toBeDefined();
  });
});

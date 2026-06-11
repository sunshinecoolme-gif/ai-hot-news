import { beforeEach, describe, expect, it, vi } from "vitest";

const ingestSources = vi.fn();
const createDrizzleIngestDb = vi.fn(() => ({ kind: "db" }));

vi.mock("@/lib/ingestion/fetch-sources", () => ({
  createDrizzleIngestDb,
  ingestSources
}));

describe("/api/cron/fetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-cron-secret-with-enough-length";
  });

  it("rejects missing bearer token", async () => {
    const { GET } = await import("./route");

    const response = await GET(new Request("https://example.com/api/cron/fetch"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(ingestSources).not.toHaveBeenCalled();
  });

  it("runs ingestion when bearer token is valid", async () => {
    ingestSources.mockResolvedValue({ processed: 1, created: 2, skipped: 0, failed: 0 });
    const { GET } = await import("./route");

    const response = await GET(
      new Request("https://example.com/api/cron/fetch", {
        headers: {
          authorization: "Bearer test-cron-secret-with-enough-length"
        }
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ processed: 1, created: 2, skipped: 0, failed: 0 });
    expect(createDrizzleIngestDb).toHaveBeenCalledOnce();
    expect(ingestSources).toHaveBeenCalledWith({ db: { kind: "db" } });
  });
});

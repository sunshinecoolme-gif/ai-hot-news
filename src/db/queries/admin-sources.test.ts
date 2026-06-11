import { beforeEach, describe, expect, it, vi } from "vitest";
import { candidates, sources } from "@/db/schema";

const queryMocks = vi.hoisted(() => {
  type UpdateCall = {
    table: unknown;
    set: ReturnType<typeof vi.fn>;
    where: ReturnType<typeof vi.fn>;
  };

  const updateCalls: UpdateCall[] = [];

  return {
    updateCalls,
    db: {
      update: vi.fn((table: unknown) => {
        const call: UpdateCall = {
          table,
          set: vi.fn(),
          where: vi.fn(async () => undefined)
        };
        call.set.mockReturnValue({ where: call.where });
        updateCalls.push(call);
        return { set: call.set };
      })
    },
    and: vi.fn((...conditions: unknown[]) => ({ type: "and", conditions })),
    desc: vi.fn((column: unknown) => ({ type: "desc", column })),
    eq: vi.fn((left: unknown, right: unknown) => ({ type: "eq", left, right }))
  };
});

vi.mock("@/db/client", () => ({
  db: queryMocks.db
}));

vi.mock("drizzle-orm", () => ({
  and: queryMocks.and,
  desc: queryMocks.desc,
  eq: queryMocks.eq
}));

import { setSourceEnabled } from "./admin-sources";

describe("setSourceEnabled", () => {
  beforeEach(() => {
    queryMocks.updateCalls.length = 0;
    queryMocks.db.update.mockClear();
    queryMocks.and.mockClear();
    queryMocks.desc.mockClear();
    queryMocks.eq.mockClear();
  });

  it("ignores new candidates from the source when disabling it", async () => {
    const sourceId = "2d7e5d38-3c6e-4a96-b59d-4ad26325fef7";

    await setSourceEnabled(sourceId, false);

    expect(queryMocks.db.update).toHaveBeenCalledTimes(2);
    expect(queryMocks.updateCalls[0].table).toBe(sources);
    expect(queryMocks.updateCalls[0].set).toHaveBeenCalledWith({
      enabled: false,
      updatedAt: expect.any(Date)
    });
    expect(queryMocks.updateCalls[0].where).toHaveBeenCalledWith({
      type: "eq",
      left: sources.id,
      right: sourceId
    });

    expect(queryMocks.updateCalls[1].table).toBe(candidates);
    expect(queryMocks.updateCalls[1].set).toHaveBeenCalledWith({
      status: "ignored",
      updatedAt: expect.any(Date)
    });
    expect(queryMocks.updateCalls[1].where).toHaveBeenCalledWith({
      type: "and",
      conditions: [
        { type: "eq", left: candidates.sourceId, right: sourceId },
        { type: "eq", left: candidates.status, right: "new" }
      ]
    });
  });

  it("does not change candidate statuses when enabling a source", async () => {
    const sourceId = "2d7e5d38-3c6e-4a96-b59d-4ad26325fef7";

    await setSourceEnabled(sourceId, true);

    expect(queryMocks.db.update).toHaveBeenCalledTimes(1);
    expect(queryMocks.updateCalls[0].table).toBe(sources);
    expect(queryMocks.updateCalls[0].set).toHaveBeenCalledWith({
      enabled: true,
      updatedAt: expect.any(Date)
    });
    expect(queryMocks.updateCalls[0].where).toHaveBeenCalledWith({
      type: "eq",
      left: sources.id,
      right: sourceId
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const actionMocks = vi.hoisted(() => ({
  auth: vi.fn(async () => ({ user: { email: "admin@example.com" } })),
  isAllowedAdmin: vi.fn(() => true),
  revalidatePath: vi.fn(),
  setSourceEnabled: vi.fn(async () => undefined)
}));

vi.mock("next/cache", () => ({
  revalidatePath: actionMocks.revalidatePath
}));

vi.mock("@/lib/admin", () => ({
  isAllowedAdmin: actionMocks.isAllowedAdmin
}));

vi.mock("@/lib/auth", () => ({
  auth: actionMocks.auth
}));

vi.mock("@/lib/env", () => ({
  env: {
    ADMIN_EMAIL: "admin@example.com"
  }
}));

vi.mock("@/db/queries/admin-sources", () => ({
  setSourceEnabled: actionMocks.setSourceEnabled
}));

import { parseSourceEnabledForm, parseSourceForm, setSourceEnabledAction } from "./sources";

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

describe("setSourceEnabledAction", () => {
  beforeEach(() => {
    actionMocks.auth.mockClear();
    actionMocks.isAllowedAdmin.mockClear();
    actionMocks.revalidatePath.mockClear();
    actionMocks.setSourceEnabled.mockClear();
  });

  it("revalidates the candidates page after toggling a source", async () => {
    const form = new FormData();
    form.set("sourceId", "2d7e5d38-3c6e-4a96-b59d-4ad26325fef7");
    form.set("enabled", "false");

    await setSourceEnabledAction(form);

    expect(actionMocks.setSourceEnabled).toHaveBeenCalledWith("2d7e5d38-3c6e-4a96-b59d-4ad26325fef7", false);
    expect(actionMocks.revalidatePath).toHaveBeenCalledWith("/admin/sources");
    expect(actionMocks.revalidatePath).toHaveBeenCalledWith("/admin/candidates");
    expect(actionMocks.revalidatePath).toHaveBeenCalledWith("/sources");
    expect(actionMocks.revalidatePath).toHaveBeenCalledWith("/");
  });
});

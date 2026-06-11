import bcrypt from "bcryptjs";
import { describe, expect, it, vi } from "vitest";
import { isAllowedAdmin, verifyAdminPassword } from "./auth";

vi.mock("next-auth", () => ({
  default: vi.fn(() => ({
    handlers: {
      GET: vi.fn(),
      POST: vi.fn()
    },
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn()
  }))
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: vi.fn((config) => config)
}));

describe("isAllowedAdmin", () => {
  it("allows the configured admin email", () => {
    expect(isAllowedAdmin("admin@example.com", "admin@example.com")).toBe(true);
  });

  it("rejects other email addresses", () => {
    expect(isAllowedAdmin("other@example.com", "admin@example.com")).toBe(false);
  });
});

describe("verifyAdminPassword", () => {
  it("validates a bcrypt hash and rejects the wrong password", async () => {
    const hash = await bcrypt.hash("correct-password", 10);

    await expect(verifyAdminPassword("correct-password", hash)).resolves.toBe(true);
    await expect(verifyAdminPassword("wrong-password", hash)).resolves.toBe(false);
  });
});

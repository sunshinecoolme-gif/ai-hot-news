import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("parses required environment variables", () => {
    const env = parseEnv({
      DATABASE_URL: "postgres://user:pass@example.com/db?sslmode=require",
      AUTH_SECRET: "test-auth-secret-with-enough-length",
      ADMIN_EMAIL: "admin@example.com",
      ADMIN_PASSWORD_HASH: "$2a$10$abcdefghijklmnopqrstuu7oI5A6Z3P9s2lWl2M6Z9Qh3Xq9G4Q8e",
      CRON_SECRET: "test-cron-secret-with-enough-length"
    });

    expect(env.ADMIN_EMAIL).toBe("admin@example.com");
  });

  it("rejects invalid administrator email", () => {
    expect(() =>
      parseEnv({
        DATABASE_URL: "postgres://user:pass@example.com/db?sslmode=require",
        AUTH_SECRET: "test-auth-secret-with-enough-length",
        ADMIN_EMAIL: "not-an-email",
        ADMIN_PASSWORD_HASH: "hash",
        CRON_SECRET: "test-cron-secret-with-enough-length"
      })
    ).toThrow();
  });
});

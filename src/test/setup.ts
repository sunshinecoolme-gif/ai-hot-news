import "@testing-library/jest-dom/vitest";

process.env.DATABASE_URL ??= "postgres://user:pass@example.com/db?sslmode=require";
process.env.AUTH_SECRET ??= "test-auth-secret-with-enough-length";
process.env.ADMIN_EMAIL ??= "admin@example.com";
process.env.ADMIN_PASSWORD_HASH ??= "$2a$10$abcdefghijklmnopqrstuu7oI5A6Z3P9s2lWl2M6Z9Qh3Xq9G4Q8e";
process.env.CRON_SECRET ??= "test-cron-secret-with-enough-length";

import { z } from "zod";

const bcryptHashPattern = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(16),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD_HASH: z.string().regex(bcryptHashPattern, "ADMIN_PASSWORD_HASH must be a bcrypt hash"),
  CRON_SECRET: z.string().min(16)
});

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(input: NodeJS.ProcessEnv): AppEnv {
  return envSchema.parse(input);
}

export const env = parseEnv(process.env);

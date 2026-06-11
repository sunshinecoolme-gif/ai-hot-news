import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { env } from "./env";

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export function isAllowedAdmin(email: string, adminEmail: string): boolean {
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
}

export async function verifyAdminPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export const authConfig = {
  trustHost: true,
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/admin/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        if (!isAllowedAdmin(email, env.ADMIN_EMAIL)) {
          return null;
        }

        const isValidPassword = await verifyAdminPassword(password, env.ADMIN_PASSWORD_HASH);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: env.ADMIN_EMAIL,
          email: env.ADMIN_EMAIL
        };
      }
    })
  ],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      if (pathname === "/admin/login") {
        return true;
      }

      if (pathname.startsWith("/admin")) {
        return Boolean(auth?.user);
      }

      return true;
    }
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

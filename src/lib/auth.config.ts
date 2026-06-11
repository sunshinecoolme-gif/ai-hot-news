import type { NextAuthConfig } from "next-auth";
import { isAllowedAdmin } from "./admin";
import { env } from "./env";

export const baseAuthConfig = {
  trustHost: true,
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/admin/login"
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      if (pathname === "/admin/login") {
        return true;
      }

      if (pathname.startsWith("/admin")) {
        const email = auth?.user?.email;
        return Boolean(email && isAllowedAdmin(email, env.ADMIN_EMAIL));
      }

      return true;
    }
  }
} satisfies NextAuthConfig;

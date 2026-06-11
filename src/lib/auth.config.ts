import type { NextAuthConfig } from "next-auth";
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
        return Boolean(auth?.user);
      }

      return true;
    }
  }
} satisfies NextAuthConfig;

import NextAuth from "next-auth";
import { baseAuthConfig } from "@/lib/auth.config";

export const { auth: middleware } = NextAuth(baseAuthConfig);

export const config = {
  matcher: ["/admin/:path*"]
};

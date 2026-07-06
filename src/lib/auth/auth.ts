import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "@/lib/db/prisma";
import { isUserRole, USER_ROLES } from "@/lib/auth/roles";
import {
  isLockedOut,
  recordFailedLogin,
  clearFailedLogins,
} from "@/lib/auth/login-rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        // Get IP for rate limiting
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";

        // Check if IP is locked out
        const lockoutSeconds = await isLockedOut(ip);
        if (lockoutSeconds !== null) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.isActive) {
          await recordFailedLogin(ip);
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
          await recordFailedLogin(ip);
          return null;
        }

        // Clear failed attempts on successful login
        await clearFailedLogins(ip);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePasswordOnFirstLogin: user.mustChangePasswordOnFirstLogin,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = isUserRole(user.role) ? user.role : USER_ROLES.USER;
        token.mustChangePasswordOnFirstLogin = Boolean(user.mustChangePasswordOnFirstLogin);
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const role = isUserRole(token.role) ? token.role : USER_ROLES.USER;

        session.user.id = typeof token.id === "string" ? token.id : token.sub ?? "";
        session.user.role = role;
        session.user.mustChangePasswordOnFirstLogin = Boolean(token.mustChangePasswordOnFirstLogin);
      }

      return session;
    },
  },
});

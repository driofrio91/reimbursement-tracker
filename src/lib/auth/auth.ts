import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "@/lib/db/prisma";
import { isUserRole, USER_ROLES } from "@/lib/auth/roles";

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

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

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

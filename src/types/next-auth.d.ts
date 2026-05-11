import { DefaultSession } from "next-auth";

import type { UserRole } from "@/lib/auth/roles";

declare module "next-auth" {
  interface User {
    role: UserRole;
    mustChangePasswordOnFirstLogin: boolean;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      mustChangePasswordOnFirstLogin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    mustChangePasswordOnFirstLogin?: boolean;
  }
}

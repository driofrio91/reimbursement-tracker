import { auth } from "@/lib/auth/auth";
import { isUserRole, USER_ROLES, type UserRole } from "@/lib/auth/roles";

type AuthErrorCode = "UNAUTHENTICATED" | "FORBIDDEN";

export class AuthorizationError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export interface AuthenticatedActor {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  mustChangePasswordOnFirstLogin: boolean;
}

export async function requireAuth(): Promise<AuthenticatedActor> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new AuthorizationError("UNAUTHENTICATED", "Debes iniciar sesion para continuar.");
  }

  const role = isUserRole(session.user.role) ? session.user.role : USER_ROLES.USER;

  return {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    role,
    mustChangePasswordOnFirstLogin: Boolean(session.user.mustChangePasswordOnFirstLogin),
  };
}

export async function requireRole(...roles: UserRole[]): Promise<AuthenticatedActor> {
  const actor = await requireAuth();

  if (!roles.includes(actor.role)) {
    throw new AuthorizationError("FORBIDDEN", "No tienes permiso para realizar esta accion.");
  }

  return actor;
}

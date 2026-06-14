import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/lib/auth/auth";
import { requireAuth, requireRole } from "@/lib/auth/authorization";
import { USER_ROLES } from "@/lib/auth/roles";

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

type AuthFn = () => Promise<{
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    mustChangePasswordOnFirstLogin: boolean;
  };
  expires: string;
} | null>;

const authMock = vi.mocked(auth as unknown as AuthFn);

describe("authorization guards", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("returns authenticated actor when session is valid", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
        name: "Operator",
        email: "operator@local.test",
        role: USER_ROLES.USER,
        mustChangePasswordOnFirstLogin: false,
      },
      expires: "2099-01-01T00:00:00.000Z",
    });

    const actor = await requireAuth();

    expect(actor).toEqual({
      id: "user-1",
      name: "Operator",
      email: "operator@local.test",
      role: USER_ROLES.USER,
      mustChangePasswordOnFirstLogin: false,
    });
  });

  it("throws UNAUTHENTICATED when session is missing", async () => {
    authMock.mockResolvedValue(null);

    await expect(requireAuth()).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
    });
  });

  it("throws FORBIDDEN when actor role is not allowed", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
        name: "Operator",
        email: "operator@local.test",
        role: USER_ROLES.USER,
        mustChangePasswordOnFirstLogin: false,
      },
      expires: "2099-01-01T00:00:00.000Z",
    });

    await expect(requireRole(USER_ROLES.ADMIN)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("allows actor when role is included", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "admin-1",
        name: "Admin",
        email: "admin@local.test",
        role: USER_ROLES.ADMIN,
        mustChangePasswordOnFirstLogin: false,
      },
      expires: "2099-01-01T00:00:00.000Z",
    });

    await expect(requireRole(USER_ROLES.ADMIN, USER_ROLES.USER)).resolves.toMatchObject({
      id: "admin-1",
      role: USER_ROLES.ADMIN,
    });
  });
});

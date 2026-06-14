export const USER_ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export function isUserRole(value: unknown): value is UserRole {
  return value === USER_ROLES.ADMIN || value === USER_ROLES.USER;
}

-- Add role and first-login password change requirement to users.
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

ALTER TABLE "User"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN "mustChangePasswordOnFirstLogin" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "User_role_idx" ON "User"("role");

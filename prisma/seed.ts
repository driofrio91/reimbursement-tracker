import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function assertLocalSeedExecution(): void {
  const nodeEnv = process.env.NODE_ENV ?? "undefined";
  const allowLocalSeed = process.env.ALLOW_LOCAL_SEED ?? "undefined";

  if (nodeEnv === "production" || allowLocalSeed !== "true") {
    throw new Error(
      [
        "Seed local bloqueado: solo permitido fuera de production y con ALLOW_LOCAL_SEED=true.",
        "Ejecuta: npm run db:seed:local",
        `NODE_ENV=${nodeEnv}`,
        `ALLOW_LOCAL_SEED=${allowLocalSeed}`,
      ].join(" "),
    );
  }
}

function getRequiredLocalPassword(variableName: "LOCAL_ADMIN_PASSWORD" | "LOCAL_OPERATOR_PASSWORD"): string {
  const value = process.env[variableName];

  if (!value || !value.trim()) {
    throw new Error(
      `Falta ${variableName}. Define una contrasena local en .env antes de ejecutar el seed de desarrollo.`,
    );
  }

  return value;
}

async function main() {
  assertLocalSeedExecution();

  const adminPassword = getRequiredLocalPassword("LOCAL_ADMIN_PASSWORD");
  const operatorPassword = getRequiredLocalPassword("LOCAL_OPERATOR_PASSWORD");

  const [adminPasswordHash, operatorPasswordHash] = await Promise.all([
    bcrypt.hash(adminPassword, 10),
    bcrypt.hash(operatorPassword, 10),
  ]);

  await prisma.user.upsert({
    where: { email: "admin@local.test" },
    update: {
      name: "Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      mustChangePasswordOnFirstLogin: false,
      isActive: true,
    },
    create: {
      email: "admin@local.test",
      name: "Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      mustChangePasswordOnFirstLogin: false,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "operator@local.test" },
    update: {
      name: "Operator",
      passwordHash: operatorPasswordHash,
      role: "USER",
      mustChangePasswordOnFirstLogin: false,
      isActive: true,
    },
    create: {
      email: "operator@local.test",
      name: "Operator",
      passwordHash: operatorPasswordHash,
      role: "USER",
      mustChangePasswordOnFirstLogin: false,
      isActive: true,
    },
  });

  await prisma.insurer.upsert({
    where: { code: "DKV" },
    update: { name: "DKV", isActive: true },
    create: { code: "DKV", name: "DKV", isActive: true },
  });

  await prisma.insurer.upsert({
    where: { code: "SANITAS" },
    update: { name: "Sanitas", isActive: true },
    create: { code: "SANITAS", name: "Sanitas", isActive: true },
  });

  await prisma.insurer.upsert({
    where: { code: "MAPFRE" },
    update: { name: "Mapfre", isActive: true },
    create: { code: "MAPFRE", name: "Mapfre", isActive: true },
  });

  await prisma.person.upsert({
    where: { displayName: "Ana Perez" },
    update: { firstName: "Ana", lastName: "Perez", isActive: true },
    create: { firstName: "Ana", lastName: "Perez", displayName: "Ana Perez", isActive: true },
  });

  await prisma.person.upsert({
    where: { displayName: "Luis Garcia" },
    update: { firstName: "Luis", lastName: "Garcia", isActive: true },
    create: { firstName: "Luis", lastName: "Garcia", displayName: "Luis Garcia", isActive: true },
  });

  await prisma.person.upsert({
    where: { displayName: "Marta Lopez" },
    update: { firstName: "Marta", lastName: "Lopez", isActive: true },
    create: { firstName: "Marta", lastName: "Lopez", displayName: "Marta Lopez", isActive: true },
  });

}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

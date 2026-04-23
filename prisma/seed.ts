import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function shouldSeedDevUsers(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const allowDevLogin =
    process.env.AUTH_ALLOW_DEV_LOGIN ?? (nodeEnv === "development" ? "true" : "false");

  if (nodeEnv === "production") {
    return false;
  }

  return allowDevLogin === "true";
}

async function main() {
  if (shouldSeedDevUsers()) {
    const [adminPasswordHash, operatorPasswordHash] = await Promise.all([
      bcrypt.hash("admin123", 10),
      bcrypt.hash("operator123", 10),
    ]);

    await prisma.user.upsert({
      where: { email: "admin@local.test" },
      update: { name: "Admin", passwordHash: adminPasswordHash, isActive: true },
      create: {
        email: "admin@local.test",
        name: "Admin",
        passwordHash: adminPasswordHash,
        isActive: true,
      },
    });

    await prisma.user.upsert({
      where: { email: "operator@local.test" },
      update: { name: "Operator", passwordHash: operatorPasswordHash, isActive: true },
      create: {
        email: "operator@local.test",
        name: "Operator",
        passwordHash: operatorPasswordHash,
        isActive: true,
      },
    });
  }

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
    update: { firstName: "Ana", lastName: "Perez" },
    create: { firstName: "Ana", lastName: "Perez", displayName: "Ana Perez" },
  });

  await prisma.person.upsert({
    where: { displayName: "Luis Garcia" },
    update: { firstName: "Luis", lastName: "Garcia" },
    create: { firstName: "Luis", lastName: "Garcia", displayName: "Luis Garcia" },
  });

  await prisma.person.upsert({
    where: { displayName: "Marta Lopez" },
    update: { firstName: "Marta", lastName: "Lopez" },
    create: { firstName: "Marta", lastName: "Lopez", displayName: "Marta Lopez" },
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

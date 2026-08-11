import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const password = "Password@123";

  const passwordHash = await bcrypt.hash(password, 10);

  const users = [
    {
      name: "Admin User",
      email: "admin@erp.com",
      role: "ADMIN" as const,
    },
    {
      name: "Sales User",
      email: "sales@erp.com",
      role: "SALES" as const,
    },
    {
      name: "Warehouse User",
      email: "warehouse@erp.com",
      role: "WAREHOUSE" as const,
    },
    {
      name: "Accounts User",
      email: "accounts@erp.com",
      role: "ACCOUNTS" as const,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        name: user.name,
        role: user.role,
        passwordHash,
      },
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash,
      },
    });
  }

  console.log("✅ Test users created successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
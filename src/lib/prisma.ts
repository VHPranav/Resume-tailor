import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

if (!process.env.DATABASE_URL) {
  console.error("CRITICAL: DATABASE_URL is not set in environment variables!");
} else {
  console.log("DATABASE_URL is found in environment.");
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

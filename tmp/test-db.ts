import { PrismaClient } from "@prisma/client";
import "dotenv/config";

async function testConnection() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not defined in .env");
    process.exit(1);
  }
  console.log("Connecting with URL (env):", url.substring(0, 25) + "...");

  const prisma = new PrismaClient({ 
    datasourceUrl: url,
    log: ['query']
  });

  try {
    const result = await prisma.user.count();
    console.log("Connection successful! User count:", result);
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

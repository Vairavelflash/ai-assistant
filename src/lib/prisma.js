import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env file");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
  adapter,
  log: ["query", "error"],   // Optional: helpful for debugging
});

export default prisma;
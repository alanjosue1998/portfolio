import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 ships no query engine, so the client reaches Postgres through a
 * driver adapter.
 */
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. See .env.");
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/**
 * Every client owns a connection pool, and hot reloading re-evaluates this
 * module on each change. Caching on `globalThis` keeps dev from opening a fresh
 * pool every time and exhausting the database's connection limit.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

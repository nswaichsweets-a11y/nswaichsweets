import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL ||= "file:../data/nss-local.db";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function hasDatabaseUrl() {
  return true;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}

export async function withDatabase<T>(query: (client: PrismaClient) => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query(prisma);
  } catch (error) {
    console.error("Database query failed; using fallback data.", error);
    return fallback;
  }
}

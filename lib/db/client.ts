import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export const prisma = hasDatabaseUrl()
  ? globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
    })
  : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}

export async function withDatabase<T>(query: (client: PrismaClient) => Promise<T>, fallback: T): Promise<T> {
  if (!prisma) return fallback;

  try {
    return await query(prisma);
  } catch (error) {
    console.error("Database query failed; using fallback data.", error);
    return fallback;
  }
}

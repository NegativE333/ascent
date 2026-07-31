import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function buildDatabaseUrl(raw: string) {
  if (!raw.startsWith("postgres")) return raw;

  const url = new URL(raw);
  // Session pooler: keep a tiny pool. Parallel queries queue instead of opening many sockets.
  if (!url.searchParams.has("connection_limit")) {
    url.searchParams.set("connection_limit", "3");
  }
  if (!url.searchParams.has("pool_timeout")) {
    url.searchParams.set("pool_timeout", "30");
  }
  return url.toString();
}

function createPrismaClient() {
  const url = buildDatabaseUrl(process.env.DATABASE_URL ?? "");

  return new PrismaClient({
    ...(url.startsWith("postgres")
      ? { datasources: { db: { url } } }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;

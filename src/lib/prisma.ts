import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function withConnectionLimit(url: string) {
  if (!url || url.includes("connection_limit=")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}connection_limit=1`;
}

function createPrismaClient() {
  const url = withConnectionLimit(process.env.DATABASE_URL ?? "");

  return new PrismaClient({
    ...(url.startsWith("postgres")
      ? { datasources: { db: { url } } }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

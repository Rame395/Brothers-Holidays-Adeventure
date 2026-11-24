import { PrismaClient } from "@prisma/client";

const PRISMA_SCHEMA_VERSION = "2026-11-23-v3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaVersion: string | undefined;
};

export const prisma =
  globalForPrisma.prisma &&
  globalForPrisma.prismaVersion === PRISMA_SCHEMA_VERSION
    ? globalForPrisma.prisma
    : new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
      });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaVersion = PRISMA_SCHEMA_VERSION;
}

export default prisma;

import { PrismaClient } from '@prisma/client';
// FORCE LOAD .env to bypass Next.js truncation bug
// Note: Manual dotenv loading via path is removed as it breaks Edge Runtime (Middleware).
// Next.js automatically loads .env files.

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query', 'error', 'warn'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

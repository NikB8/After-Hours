import { PrismaClient } from '@prisma/client';

// try {
//     if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
//         // eslint-disable-next-line @typescript-eslint/no-require-imports
//         const path = require('path');
//         // eslint-disable-next-line @typescript-eslint/no-require-imports
//         const dotenv = require('dotenv');
//         const envPath = path.resolve(process.cwd(), '.env');
//         dotenv.config({ path: envPath, override: true });
//     }
// } catch (e) {
//     // Ignore errors in environments where path/dotenv/process.cwd are unavailable
// }

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query', 'error', 'warn'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

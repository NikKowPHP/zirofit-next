// src/lib/prisma.ts
import { PrismaClient } from '@/generated/prisma';

declare global {
  // allow global declarations
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // Optional: log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
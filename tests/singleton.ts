// tests/singleton.ts
import { PrismaClient } from '@prisma/client';
import { mockReset, DeepMockProxy } from 'jest-mock-extended';
import { prisma } from '@/lib/prisma';

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
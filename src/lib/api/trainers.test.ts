// src/lib/api/trainers.test.ts
import { getPublishedTrainers } from './trainers';
import { prisma } from '@/lib/prisma';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;


describe('Trainer API Logic', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });
  
  it('should build the correct where-clause for a combined query and location search', async () => {
    const query = 'yoga';
    const location = 'New York';
    const page = 1;
    const pageSize = 10;

    // Mock Prisma calls to prevent real DB access
    prismaMock.user.findMany.mockResolvedValue([]);
    prismaMock.user.count.mockResolvedValue(0);
    
    await getPublishedTrainers(page, pageSize, query, location);

    // Verify that the Prisma client was called with a correctly structured 'where' argument
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      where: {
        role: 'trainer',
        profile: { isNot: null },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
          { profile: { certifications: { contains: query, mode: 'insensitive' } } },
          { profile: { aboutMe: { contains: query, mode: 'insensitive' } } },
          { profile: { methodology: { contains: query, mode: 'insensitive' } } },
          { profile: { philosophy: { contains: query, mode: 'insensitive' } } },
        ],
        AND: [
          { profile: { location: { contains: location, mode: 'insensitive' } } }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        profile: {
          select: {
            profilePhotoPath: true,
            location: true,
            certifications: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  });
});
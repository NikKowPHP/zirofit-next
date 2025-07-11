// src/lib/api/trainers.test.ts
import { getPublishedTrainers } from './trainers';
import { prismaMock } from '../../../tests/singleton';

describe('Trainer API Logic', () => {
  it('should build the correct where-clause for a combined query and location search', async () => {
    const query = 'yoga';
    const location = 'New York';
    
    await getPublishedTrainers(1, 10, query, location);

    // Verify that the Prisma client was called with a correctly structured 'where' argument
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
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
      }
    }));
  });
});
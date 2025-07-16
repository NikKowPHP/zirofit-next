// src/lib/api/trainers.test.ts
import { getPublishedTrainers } from "./trainers";
import { prismaMock } from "@tests/singleton";
import * as utils from '../utils';

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  normalizeLocation: jest.fn((loc: string) => {
    if (!loc) return '';
    return loc
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l');
  }),
}));

describe("Trainer API Logic", () => {
  beforeEach(() => {
    (utils.normalizeLocation as jest.Mock).mockClear();
    prismaMock.user.findMany.mockResolvedValue([]);
    prismaMock.user.count.mockResolvedValue(0);
  });

  it("should build correct where-clause for combined query and location search", async () => {
    const query = "yoga";
    const location = "Łódź";
    await getPublishedTrainers(1, 10, query, location);

    expect(utils.normalizeLocation).toHaveBeenCalledWith(location);

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        role: "trainer",
        profile: { isNot: null },
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
          { profile: { certifications: { contains: query, mode: "insensitive" } } },
          { profile: { aboutMe: { contains: query, mode: "insensitive" } } },
          { profile: { methodology: { contains: query, mode: "insensitive" } } },
          { profile: { philosophy: { contains: query, mode: "insensitive" } } },
        ],
        AND: [
          {
            profile: { locationNormalized: { contains: "lodz" } },
          },
        ],
      },
    }));
  });

  it('should apply "newest" sorting correctly', async () => {
    await getPublishedTrainers(1, 10, undefined, undefined, 'newest');
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { createdAt: 'desc' },
    }));
  });

  it('should apply "name_desc" sorting correctly', async () => {
    await getPublishedTrainers(1, 10, undefined, undefined, 'name_desc');
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { name: 'desc' },
    }));
  });

  it('should default to "name_asc" sorting', async () => {
    await getPublishedTrainers(1, 10, undefined, undefined, undefined);
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { name: 'asc' },
    }));
  });
});
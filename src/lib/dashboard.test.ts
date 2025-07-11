// src/lib/dashboard.test.ts
import { getDashboardData } from './dashboard';
import { prismaMock } from '../../tests/singleton';

describe('Dashboard Data Service', () => {
  it('should correctly aggregate client counts and session data', async () => {
    const trainerId = 'test-trainer-id';

    // MOCK: Provide mock return values for each Prisma call within getDashboardData
    prismaMock.client.count
      .mockResolvedValueOnce(5) // For activeClients
      .mockResolvedValueOnce(2); // For pendingClients
    prismaMock.clientSessionLog.count.mockResolvedValue(12); // For sessionsThisMonth
    prismaMock.profile.findUnique.mockResolvedValue({} as any); // Mock profile object
    prismaMock.clientSessionLog.findMany.mockResolvedValue([]); // For activity feed
    prismaMock.clientMeasurement.findMany.mockResolvedValue([]); // For activity feed
    prismaMock.clientProgressPhoto.findMany.mockResolvedValue([]); // For activity feed
    prismaMock.client.findMany.mockResolvedValue([]); // For spotlight client

    const data = await getDashboardData(trainerId);

    expect(data.activeClients).toBe(5);
    expect(data.pendingClients).toBe(2);
    expect(data.sessionsThisMonth).toBe(12);
    expect(prismaMock.client.count).toHaveBeenCalledWith({ where: { trainerId, status: 'active' } });
    expect(prismaMock.client.count).toHaveBeenCalledWith({ where: { trainerId, status: 'pending' } });
  });
});
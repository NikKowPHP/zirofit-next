
import { getDashboardData } from "./dashboardService";
import { prismaMock } from "@tests/singleton";

describe("Dashboard Data Service", () => {
  it("should fetch all dashboard data points correctly", async () => {
    const trainerId = "test-trainer-id";
    const now = new Date();

    // Mock individual prisma calls in the order they appear in getDashboardData
    prismaMock.client.count
      .mockResolvedValueOnce(5) // activeClients
      .mockResolvedValueOnce(2); // pendingClients

    prismaMock.clientSessionLog.count.mockResolvedValue(12);

    prismaMock.profile.findUnique.mockResolvedValue({
      services: [],
      testimonials: [],
      transformationPhotos: [],
    } as any);

    prismaMock.clientSessionLog.findMany
      .mockResolvedValueOnce([
        {
          sessionDate: new Date(now.getTime() + 86400000),
          client: { name: "Upcoming Client" },
        },
      ] as any) // upcomingSessions
      .mockResolvedValueOnce([
        {
          sessionDate: new Date(now.getTime() - 86400000),
          client: { name: "Past Client" },
        },
      ] as any); // pastSessions

    // Chained mocks for clientMeasurement.findMany
    prismaMock.clientMeasurement.findMany
      .mockResolvedValueOnce([
        { createdAt: now, client: { name: "Measured Client" } },
      ] as any) // First call for recentMeasurements
      .mockResolvedValueOnce([
        { measurementDate: now, weightKg: 80 },
      ] as any); // Second call for getSpotlightClient

    prismaMock.clientProgressPhoto.findMany.mockResolvedValue([
      { createdAt: now, client: { name: "Photo Client" } },
    ] as any);

    // Mock for getSpotlightClient's client query
    prismaMock.client.findMany.mockResolvedValueOnce([
      {
        id: "spotlight-client",
        name: "Spotlight Client",
        _count: { measurements: 2 },
      },
    ] as any);

    const data = await getDashboardData(trainerId);

    // Assert that the mocks were called
    expect(prismaMock.client.count).toHaveBeenCalledTimes(2);
    expect(prismaMock.clientSessionLog.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.profile.findUnique).toHaveBeenCalledTimes(1);

    // Assert stats
    expect(data.activeClients).toBe(5);
    expect(data.pendingClients).toBe(2);
    expect(data.sessionsThisMonth).toBe(12);

    // Assert activity feed
    expect(data.activityFeed.length).toBeGreaterThanOrEqual(1);
    expect(data.activityFeed[0].type).toBe("UPCOMING_SESSION");

    // Assert spotlight data
    expect(data.clientProgressData).toBeDefined();
    expect(data.clientProgressData.length).toBe(1);
    expect(data.clientProgressData[0].y).toBe(80);
  });
});
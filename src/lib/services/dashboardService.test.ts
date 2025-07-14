// src/lib/services/dashboardService.test.ts
import { getDashboardData } from "./dashboardService";
import { prismaMock } from "../../../tests/singleton";

describe("Dashboard Data Service", () => {
  it("should correctly aggregate data and create activity feed", async () => {
    const trainerId = "test-trainer-id";

    // Mocks for stats
    prismaMock.client.count
      .mockResolvedValueOnce(5) // activeClients
      .mockResolvedValueOnce(2); // pendingClients
    prismaMock.clientSessionLog.count.mockResolvedValue(12); // sessionsThisMonth
    prismaMock.profile.findUnique.mockResolvedValue({
      services: [],
      testimonials: [],
      transformationPhotos: [],
    } as any);

    // Mocks for activity feed
    const now = new Date();
    prismaMock.clientSessionLog.findMany
      .mockResolvedValueOnce([
        {
          sessionDate: new Date(now.getTime() + 86400000),
          client: { name: "Upcoming Client" },
        },
      ] as any) // upcoming sessions
      .mockResolvedValueOnce([
        {
          sessionDate: new Date(now.getTime() - 86400000),
          client: { name: "Past Client" },
        },
      ] as any); // past sessions

    // Correctly ordered mocks for clientMeasurement.findMany
    prismaMock.clientMeasurement.findMany
      .mockResolvedValueOnce([ // Call 1: for recentMeasurements in activity feed
        { createdAt: new Date(), client: { name: "Measured Client" } },
      ] as any)
      .mockResolvedValueOnce([ // Call 2: for getSpotlightClient's measurements
        {
          measurementDate: new Date(),
          weightKg: 80,
        },
      ] as any);
      
    prismaMock.clientProgressPhoto.findMany.mockResolvedValue([
      { createdAt: new Date(), client: { name: "Photo Client" } },
    ] as any);

    // Mock for spotlight client
    prismaMock.client.findMany.mockResolvedValueOnce([
      {
        id: "spotlight-client",
        name: "Spotlight Client",
        _count: { measurements: 2 },
      },
    ] as any);
    
    const data = await getDashboardData(trainerId);

    // Assert stats
    expect(data.activeClients).toBe(5);
    expect(data.pendingClients).toBe(2);
    expect(data.sessionsThisMonth).toBe(12);

    // Assert activity feed
    expect(data.activityFeed).toHaveLength(4);
    expect(data.activityFeed[0].type).toBe("UPCOMING_SESSION");

    // Assert spotlight data
    expect(data.clientProgressData).toBeDefined();
    expect(data.clientProgressData.length).toBe(1);
    expect(data.clientProgressData[0].y).toBe(80);
  });
});

// src/lib/services/dashboardService.test.ts
import { getDashboardData } from "./dashboardService";
import { prismaMock } from "@tests/singleton";

describe("Dashboard Data Service", () => {
  it("should use prisma.$transaction to fetch data in parallel", async () => {
    const trainerId = "test-trainer-id";
    const now = new Date();

    // Mock the results for each query in the transaction array
    const transactionResults = [
      5, // activeClients
      12, // sessionsThisMonth
      2, // pendingClients
      { services: [], testimonials: [], transformationPhotos: [], benefits: [] }, // profile
      [{ sessionDate: new Date(now.getTime() + 86400000), client: { name: "Upcoming Client" } }], // upcomingSessions
      [{ createdAt: now, client: { name: "Measured Client" } }], // recentMeasurements
      [{ sessionDate: new Date(now.getTime() - 86400000), client: { name: "Past Client" } }], // pastSessions
      [{ createdAt: now, client: { name: "Photo Client" } }], // progressPhotos
    ];

    prismaMock.$transaction.mockResolvedValue(transactionResults as any);

    // Mocks for getSpotlightClient, which is called separately
    prismaMock.client.findMany.mockResolvedValueOnce([
      {
        id: "spotlight-client",
        name: "Spotlight Client",
        _count: { measurements: 2 },
      },
    ] as any);
    prismaMock.clientMeasurement.findMany.mockResolvedValueOnce([
      {
        measurementDate: now,
        weightKg: 80,
      },
    ] as any);
    
    const data = await getDashboardData(trainerId);

    // Assert that $transaction was called
    expect(prismaMock.$transaction).toHaveBeenCalled();
    // Check if the number of promises in the transaction is correct
    expect(prismaMock.$transaction.mock.calls[0][0]).toHaveLength(8);


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
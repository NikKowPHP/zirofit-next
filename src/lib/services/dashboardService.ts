import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { ChartDataService } from "./ChartDataService";

interface ActivityItem {
  type:
    | "UPCOMING_SESSION"
    | "NEW_MEASUREMENT"
    | "PROGRESS_PHOTO"
    | "PAST_SESSION";
  date: Date;
  clientName: string;
  message: string;
}

/**
 * Aggregates and retrieves all necessary data for the trainer dashboard.
 * @param {string} trainerId - The ID of the logged-in trainer.
 * @returns {Promise<object>} A promise that resolves to an object containing all dashboard data.
 */
export async function getDashboardData(trainerId: string) {
  const activeClients = await prisma.client.count({
    where: { trainerId, status: "active" },
  });

  const sessionsThisMonth = await prisma.clientSessionLog.count({
    where: {
      client: { trainerId },
      sessionDate: {
        gte: startOfMonth(new Date()),
        lte: endOfMonth(new Date()),
      },
    },
  });

  const pendingClients = await prisma.client.count({
    where: { trainerId, status: "pending" },
  });

  const profile = await prisma.profile.findUnique({
    where: { userId: trainerId },
    include: {
      services: true,
      testimonials: true,
      transformationPhotos: true,
    },
  });

  // Fetch activity feed data
  const upcomingSessions = await prisma.clientSessionLog.findMany({
    where: {
      client: { trainerId },
      sessionDate: { gte: new Date() },
    },
    orderBy: { sessionDate: "asc" },
    take: 3,
    include: { client: { select: { name: true } } },
  });

  const recentMeasurements = await prisma.clientMeasurement.findMany({
    where: { client: { trainerId } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { client: { select: { name: true } } },
  });

  const pastSessions = await prisma.clientSessionLog.findMany({
    where: {
      client: { trainerId },
      sessionDate: { lt: new Date() },
    },
    orderBy: { sessionDate: "desc" },
    take: 5,
    include: { client: { select: { name: true } } },
  });

  const progressPhotos = await prisma.clientProgressPhoto.findMany({
    where: { client: { trainerId } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { client: { select: { name: true } } },
  });

  // Merge and format activities
  const activityFeed: ActivityItem[] = [
    ...upcomingSessions.map(
      (session: { sessionDate: Date; client: { name: string } }) => ({
        type: "UPCOMING_SESSION" as const,
        date: session.sessionDate,
        clientName: session.client.name,
        message: `Session with ${session.client.name} at ${session.sessionDate.toLocaleTimeString()}`,
      }),
    ),
    ...recentMeasurements.map((measurement) => ({
      type: "NEW_MEASUREMENT" as const,
      date: measurement.createdAt,
      clientName: measurement.client.name,
      message: `New measurement logged for ${measurement.client.name}`,
    })),
    ...pastSessions.map(
      (session: { sessionDate: Date; client: { name: string } }) => ({
        type: "PAST_SESSION" as const,
        date: session.sessionDate,
        clientName: session.client.name,
        message: `Completed session with ${session.client.name}`,
      }),
    ),
    ...progressPhotos.map(
      (photo: { createdAt: Date; client: { name: string } }) => ({
        type: "PROGRESS_PHOTO" as const,
        date: photo.createdAt,
        clientName: photo.client.name,
        message: `New progress photo from ${photo.client.name}`,
      }),
    ),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const spotlight = await getSpotlightClient(trainerId);

  // Format data for charts, providing empty arrays as fallbacks
  const clientProgressData = spotlight
    ? ChartDataService.formatProgressData(spotlight.measurements)
    : [];

  // Create sample data for the monthly activity chart
  const monthlyActivityData = ChartDataService.formatActivityData([
    { week: 1, count: 5 },
    { week: 2, count: 8 },
    { week: 3, count: 3 },
    { week: 4, count: 12 },
  ]);

  return {
    activeClients,
    sessionsThisMonth,
    pendingClients,
    profile,
    activityFeed,
    clientProgressData,
    monthlyActivityData,
  };
}

/**
 * Finds a client who is making progress to feature on the dashboard.
 * @param {string} trainerId - The ID of the trainer.
 * @returns {Promise<object | null>} A promise that resolves to a spotlight client object or null.
 */
async function getSpotlightClient(trainerId: string) {
  // Find clients with at least 2 measurements in last 45 days
  const eligibleClients = await prisma.client.findMany({
    where: {
      trainerId,
      measurements: {
        some: {
          createdAt: {
            gte: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          },
        },
      },
    },
    include: {
      _count: {
        select: { measurements: true },
      },
    },
  });

  // Filter clients with at least 2 measurements
  const clientsWithEnoughData = eligibleClients.filter(
    (client: { _count: { measurements: number } }) =>
      client._count.measurements >= 2,
  );

  if (clientsWithEnoughData.length === 0) {
    return null;
  }

  // Select first eligible client
  const client = clientsWithEnoughData[0];

  // Get client's measurements
  const measurements = await prisma.clientMeasurement.findMany({
    where: {
      clientId: client.id,
    },
    orderBy: {
      measurementDate: "asc", // Order by measurementDate
    },
    take: 10, // Get last 10 measurements
  });

  return {
    name: client.name,
    measurements: measurements
      .filter((m) => m.weightKg != null) // Ensure we only plot measurements with a weight
      .map((m) => ({
        date: m.measurementDate, // Use the actual date of the measurement
        value: m.weightKg!, // Use the weightKg as the value
        type: "weight", // Explicitly define the type for the chart
      })),
  };
}
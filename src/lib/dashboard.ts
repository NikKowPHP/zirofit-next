import { prisma } from './prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

interface ActivityItem {
  type: 'UPCOMING_SESSION' | 'NEW_MEASUREMENT' | 'PROGRESS_PHOTO' | 'PAST_SESSION';
  date: Date;
  clientName: string;
  message: string;
}

export async function getDashboardData(trainerId: string) {
  const activeClients = await prisma.client.count({
    where: { trainerId, status: 'active' },
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
    where: { trainerId, status: 'pending' },
  });

  const profile = await prisma.profile.findUnique({
    where: { trainerId },
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
      sessionDate: { gte: new Date() }
    },
    orderBy: { sessionDate: 'asc' },
    take: 3,
    include: { client: { select: { name: true } } }
  });

  const recentMeasurements = await prisma.clientMeasurement.findMany({
    where: { client: { trainerId } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { client: { select: { name: true } } }
  });

  const pastSessions = await prisma.clientSessionLog.findMany({
    where: {
      client: { trainerId },
      sessionDate: { lt: new Date() }
    },
    orderBy: { sessionDate: 'desc' },
    take: 5,
    include: { client: { select: { name: true } } }
  });

  const progressPhotos = await prisma.clientProgressPhoto.findMany({
    where: { client: { trainerId } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { client: { select: { name: true } } }
  });

  // Merge and format activities
  const activityFeed: ActivityItem[] = [
    ...upcomingSessions.map((session: { sessionDate: Date; client: { name: string } }) => ({
      type: 'UPCOMING_SESSION' as const,
      date: session.sessionDate,
      clientName: session.client.name,
      message: `Session with ${session.client.name} at ${session.sessionDate.toLocaleTimeString()}`
    })),
    ...recentMeasurements.map((measurement: { type: string; createdAt: Date; client: { name: string } }) => ({
      type: 'NEW_MEASUREMENT' as const,
      date: measurement.createdAt,
      clientName: measurement.client.name,
      message: `New ${measurement.type} measurement for ${measurement.client.name}`
    })),
    ...pastSessions.map((session: { sessionDate: Date; client: { name: string } }) => ({
      type: 'PAST_SESSION' as const,
      date: session.sessionDate,
      clientName: session.client.name,
      message: `Completed session with ${session.client.name}`
    })),
    ...progressPhotos.map((photo: { createdAt: Date; client: { name: string } }) => ({
      type: 'PROGRESS_PHOTO' as const,
      date: photo.createdAt,
      clientName: photo.client.name,
      message: `New progress photo from ${photo.client.name}`
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return {
    activeClients,
    sessionsThisMonth,
    pendingClients,
    profile,
    activityFeed,
    spotlightClient: await getSpotlightClient(trainerId),
  };
}

async function getSpotlightClient(trainerId: string) {
  // Find clients with at least 2 measurements in last 45 days
  const eligibleClients = await prisma.client.findMany({
    where: {
      trainerId,
      measurements: {
        some: {
          createdAt: {
            gte: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
          }
        },
      }
    },
    include: {
      _count: {
        select: { measurements: true }
      }
    }
  });

  // Filter clients with at least 2 measurements
  const clientsWithEnoughData = eligibleClients.filter(
    (client: { _count: { measurements: number } }) => client._count.measurements >= 2
  );

  if (clientsWithEnoughData.length === 0) {
    return null;
  }

  // Select first eligible client
  const client = clientsWithEnoughData[0];

  // Get client's measurements
  const measurements = await prisma.clientMeasurement.findMany({
    where: {
      clientId: client.id
    },
    orderBy: {
      createdAt: 'asc'
    },
    take: 10 // Get last 10 measurements
  });

  return {
    name: client.name,
    measurements: measurements.map((m: { createdAt: Date; value: number; type: string }) => ({
      date: m.createdAt,
      value: m.value,
      type: m.type
    }))
  };
}
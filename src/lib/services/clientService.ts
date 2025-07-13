import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Data fetching
export const getClientsByTrainerId = async (trainerId: string) => {
  return prisma.client.findMany({
    where: { trainerId },
    orderBy: { name: "asc" },
  });
};

export const getClientForTrainer = async (
  clientId: string,
  trainerId: string,
) => {
  return prisma.client.findFirst({
    where: { id: clientId, trainerId },
  });
};

export const getClientDetailsForTrainer = async (
  clientId: string,
  trainerId: string,
) => {
  return prisma.client.findFirst({
    where: { id: clientId, trainerId: trainerId },
    include: {
      measurements: { orderBy: { measurementDate: "desc" } },
      progressPhotos: { orderBy: { photoDate: "desc" } },
      sessionLogs: { orderBy: { sessionDate: "desc" } },
    },
  });
};

// Data mutations
export const createClient = async (data: Prisma.ClientUncheckedCreateInput) => {
  return prisma.client.create({ data });
};

export const updateClientById = async (
  clientId: string,
  data: Prisma.ClientUncheckedUpdateInput,
) => {
  return prisma.client.update({ where: { id: clientId }, data });
};

export const deleteClientById = async (clientId: string) => {
  return prisma.client.delete({ where: { id: clientId } });
};

export const deleteClientsByIds = async (
  clientIds: string[],
  trainerId: string,
) => {
  const { count } = await prisma.client.deleteMany({
    where: {
      id: { in: clientIds },
      trainerId: trainerId,
    },
  });
  return count;
};

export const getClientsForExport = async (
  clientIds: string[],
  trainerId: string,
) => {
  return prisma.client.findMany({
    where: {
      id: { in: clientIds },
      trainerId: trainerId,
    },
    include: {
      measurements: { orderBy: { measurementDate: "desc" } },
      progressPhotos: { orderBy: { photoDate: "desc" } },
      sessionLogs: { orderBy: { sessionDate: "desc" } },
    },
  });
};
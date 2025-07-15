
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Fetches all clients for a specific trainer, ordered by name.
 * @param {string} trainerId - The ID of the trainer.
 * @returns {Promise<Client[]>} A promise that resolves to an array of clients.
 */
export const getClientsByTrainerId = async (trainerId: string) => {
  return prisma.client.findMany({
    where: { trainerId },
    orderBy: { name: "asc" },
  });
};

/**
 * Fetches a single client for a specific trainer.
 * @param {string} clientId - The ID of the client.
 * @param {string} trainerId - The ID of the trainer to authorize access.
 * @returns {Promise<Client | null>} A promise that resolves to the client or null if not found.
 */
export const getClientForTrainer = async (
  clientId: string,
  trainerId: string,
) => {
  return prisma.client.findFirst({
    where: { id: clientId, trainerId },
  });
};

/**
 * Fetches detailed information for a single client, including related measurements, photos, and logs.
 * @param {string} clientId - The ID of the client.
 * @param {string} trainerId - The ID of the trainer to authorize access.
 * @returns {Promise<object | null>} A promise that resolves to the client details or null if not found.
 */
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
      exerciseLogs: {
        include: { exercise: true },
        orderBy: { logDate: "desc" },
      },
    },
  });
};

/**
 * Creates a new client in the database.
 * @param {Prisma.ClientUncheckedCreateInput} data - The data for the new client.
 * @returns {Promise<Client>} A promise that resolves to the created client.
 */
export const createClient = async (data: Prisma.ClientUncheckedCreateInput) => {
  return prisma.client.create({ data });
};

/**
 * Updates a client's information by their ID.
 * @param {string} clientId - The ID of the client to update.
 * @param {Prisma.ClientUncheckedUpdateInput} data - The data to update.
 * @returns {Promise<Client>} A promise that resolves to the updated client.
 */
export const updateClientById = async (
  clientId: string,
  data: Prisma.ClientUncheckedUpdateInput,
) => {
  return prisma.client.update({ where: { id: clientId }, data });
};

/**
 * Deletes a client by their ID.
 * @param {string} clientId - The ID of the client to delete.
 * @returns {Promise<Client>} A promise that resolves to the deleted client.
 */
export const deleteClientById = async (clientId: string) => {
  return prisma.client.delete({ where: { id: clientId } });
};

/**
 * Deletes multiple clients by their IDs for a specific trainer.
 * @param {string[]} clientIds - An array of client IDs to delete.
 * @param {string} trainerId - The ID of the trainer to authorize access.
 * @returns {Promise<number>} A promise that resolves to the count of deleted clients.
 */
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

/**
 * Fetches multiple clients with their full details for export.
 * @param {string[]} clientIds - An array of client IDs to fetch.
 * @param {string} trainerId - The ID of the trainer to authorize access.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of clients with their details.
 */
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

/**
 * Creates a new session log for a client.
 * @param {Prisma.ClientSessionLogUncheckedCreateInput} data - The data for the new session log.
 * @returns {Promise<ClientSessionLog>} A promise that resolves to the created session log.
 */
export const createSessionLog = async (
  data: Prisma.ClientSessionLogUncheckedCreateInput,
) => {
  return prisma.clientSessionLog.create({ data });
};

/**
 * Updates a session log by its ID.
 * @param {string} id - The ID of the session log to update.
 * @param {Prisma.ClientSessionLogUncheckedUpdateInput} data - The data to update.
 * @returns {Promise<ClientSessionLog>} A promise that resolves to the updated session log.
 */
export const updateSessionLogById = async (
  id: string,
  data: Prisma.ClientSessionLogUncheckedUpdateInput,
) => {
  return prisma.clientSessionLog.update({ where: { id }, data });
};

/**
 * Finds a session log by its ID.
 * @param {string} id - The ID of the session log.
 * @returns {Promise<ClientSessionLog | null>} A promise that resolves to the session log or null.
 */
export const findSessionLogById = async (id: string) => {
  return prisma.clientSessionLog.findUnique({ where: { id } });
};

/**
 * Deletes a session log by its ID.
 * @param {string} id - The ID of the session log to delete.
 * @returns {Promise<ClientSessionLog>} A promise that resolves to the deleted session log.
 */
export const deleteSessionLogById = async (id: string) => {
  return prisma.clientSessionLog.delete({ where: { id } });
};

/**
 * Creates a new measurement for a client.
 * @param {Prisma.ClientMeasurementUncheckedCreateInput} data - The measurement data.
 * @returns {Promise<ClientMeasurement>} A promise that resolves to the created measurement.
 */
export const createMeasurement = async (
  data: Prisma.ClientMeasurementUncheckedCreateInput,
) => {
  return prisma.clientMeasurement.create({ data });
};

/**
 * Updates a measurement by its ID.
 * @param {string} id - The ID of the measurement to update.
 * @param {Prisma.ClientMeasurementUncheckedUpdateInput} data - The data to update.
 * @returns {Promise<ClientMeasurement>} A promise that resolves to the updated measurement.
 */
export const updateMeasurementById = async (
  id: string,
  data: Prisma.ClientMeasurementUncheckedUpdateInput,
) => {
  return prisma.clientMeasurement.update({ where: { id }, data });
};

/**
 * Finds a measurement by its ID.
 * @param {string} id - The ID of the measurement.
 * @returns {Promise<{clientId: string} | null>} A promise that resolves to an object with the client ID.
 */
export const findMeasurementById = async (id: string) => {
  return prisma.clientMeasurement.findUnique({
    where: { id },
    select: { clientId: true },
  });
};

/**
 * Deletes a measurement by its ID.
 * @param {string} id - The ID of the measurement to delete.
 * @returns {Promise<ClientMeasurement>} A promise that resolves to the deleted measurement.
 */
export const deleteMeasurementById = async (id: string) => {
  return prisma.clientMeasurement.delete({ where: { id } });
};

/**
 * Creates a new progress photo record for a client.
 * @param {Prisma.ClientProgressPhotoUncheckedCreateInput} data - The progress photo data.
 * @returns {Promise<ClientProgressPhoto>} A promise that resolves to the created photo record.
 */
export const createProgressPhoto = async (
  data: Prisma.ClientProgressPhotoUncheckedCreateInput,
) => {
  return prisma.clientProgressPhoto.create({ data });
};

/**
 * Finds a progress photo by its ID.
 * @param {string} id - The ID of the progress photo.
 * @returns {Promise<ClientProgressPhoto | null>} A promise that resolves to the photo record or null.
 */
export const findProgressPhotoById = async (id: string) => {
  return prisma.clientProgressPhoto.findUnique({ where: { id } });
};

/**
 * Deletes a progress photo record by its ID.
 * @param {string} id - The ID of the photo record to delete.
 * @returns {Promise<ClientProgressPhoto>} A promise that resolves to the deleted photo record.
 */
export const deleteProgressPhotoById = async (id: string) => {
  return prisma.clientProgressPhoto.delete({ where: { id } });
};

// Exercise and Log related services
export const searchExercises = async (query: string) => {
  return prisma.exercise.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    take: 10,
  });
};

export const createExerciseLog = async (
  data: Prisma.ClientExerciseLogUncheckedCreateInput,
) => {
  return prisma.clientExerciseLog.create({
    data,
    include: { exercise: true },
  });
};

export const updateExerciseLog = async (
  id: string,
  data: Prisma.ClientExerciseLogUncheckedUpdateInput,
) => {
  return prisma.clientExerciseLog.update({
    where: { id },
    data,
    include: { exercise: true },
  });
};

export const findExerciseLogById = async (id: string) => {
  return prisma.clientExerciseLog.findUnique({ where: { id } });
};

export const deleteExerciseLog = async (id: string) => {
  return prisma.clientExerciseLog.delete({ where: { id } });
};

import { prismaMock } from "../../../tests/singleton";
import * as clientService from "./clientService";

describe("Client Service", () => {
  const trainerId = "test-trainer-id";
  const clientId = "test-client-id";
  const exerciseId = "exercise-1";
  const logId = "log-1";

  it("should get clients for a specific trainer", async () => {
    const mockClients = [{ id: clientId, name: "Test Client", trainerId }];
    prismaMock.client.findMany.mockResolvedValue(mockClients as any);

    const clients = await clientService.getClientsByTrainerId(trainerId);
    expect(clients).toEqual(mockClients);
    expect(prismaMock.client.findMany).toHaveBeenCalledWith({
      where: { trainerId },
      orderBy: { name: "asc" },
    });
  });

  it("should get client details for a specific trainer including exercise logs", async () => {
    await clientService.getClientDetailsForTrainer(clientId, trainerId);
    expect(prismaMock.client.findFirst).toHaveBeenCalledWith({
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
  });

  it("should create a new client", async () => {
    const clientData = { name: "New Client", email: "new@test.com", trainerId };
    const createdClient = { id: "new-client-id", ...clientData };
    prismaMock.client.create.mockResolvedValue(createdClient as any);

    const result = await clientService.createClient(clientData as any);
    expect(result).toEqual(createdClient);
    expect(prismaMock.client.create).toHaveBeenCalledWith({ data: clientData });
  });

  it("should update a client by ID", async () => {
    const updateData = { name: "Updated Name" };
    const updatedClient = { id: clientId, name: "Updated Name", trainerId };
    prismaMock.client.update.mockResolvedValue(updatedClient as any);

    const result = await clientService.updateClientById(clientId, updateData);
    expect(result).toEqual(updatedClient);
    expect(prismaMock.client.update).toHaveBeenCalledWith({
      where: { id: clientId },
      data: updateData,
    });
  });

  it("should delete a client by ID", async () => {
    const deletedClient = { id: clientId, name: "Deleted Client", trainerId };
    prismaMock.client.delete.mockResolvedValue(deletedClient as any);

    await clientService.deleteClientById(clientId);
    expect(prismaMock.client.delete).toHaveBeenCalledWith({
      where: { id: clientId },
    });
  });

  it("should delete multiple clients by IDs", async () => {
    const clientIds = ["client-1", "client-2"];
    prismaMock.client.deleteMany.mockResolvedValue({ count: 2 });
    await clientService.deleteClientsByIds(clientIds, trainerId);
    expect(prismaMock.client.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: clientIds },
        trainerId,
      },
    });
  });

  it("should get clients for export", async () => {
    const clientIds = ["client-1", "client-2"];
    await clientService.getClientsForExport(clientIds, trainerId);
    expect(prismaMock.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: { in: clientIds },
          trainerId,
        },
      }),
    );
  });

  // New tests for exercise functions
  describe("Exercise-related functions", () => {
    it("should search for exercises", async () => {
      const query = "bench";
      await clientService.searchExercises(query);
      expect(prismaMock.exercise.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 10,
      });
    });

    it("should create an exercise log", async () => {
      const logData = {
        clientId,
        exerciseId,
        logDate: new Date(),
        sets: [{ reps: 10, weight: 100 }],
      };
      await clientService.createExerciseLog(logData as any);
      expect(prismaMock.clientExerciseLog.create).toHaveBeenCalledWith({
        data: logData,
        include: { exercise: true },
      });
    });

    it("should update an exercise log", async () => {
      const updateData = { sets: [{ reps: 12, weight: 105 }] };
      await clientService.updateExerciseLog(logId, updateData);
      expect(prismaMock.clientExerciseLog.update).toHaveBeenCalledWith({
        where: { id: logId },
        data: updateData,
        include: { exercise: true },
      });
    });

    it("should find an exercise log by ID", async () => {
      await clientService.findExerciseLogById(logId);
      expect(prismaMock.clientExerciseLog.findUnique).toHaveBeenCalledWith({
        where: { id: logId },
      });
    });

    it("should delete an exercise log", async () => {
      await clientService.deleteExerciseLog(logId);
      expect(prismaMock.clientExerciseLog.delete).toHaveBeenCalledWith({
        where: { id: logId },
      });
    });
  });
});
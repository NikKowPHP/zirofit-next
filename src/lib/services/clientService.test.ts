
import { prismaMock } from "../../../tests/singleton";
import * as clientService from "./clientService";

describe("Client Service", () => {
  const trainerId = "test-trainer-id";
  const clientId = "test-client-id";

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

  it("should get client details for a specific trainer", async () => {
    await clientService.getClientDetailsForTrainer(clientId, trainerId);
    expect(prismaMock.client.findFirst).toHaveBeenCalledWith({
      where: { id: clientId, trainerId: trainerId },
      include: {
        measurements: { orderBy: { measurementDate: "desc" } },
        progressPhotos: { orderBy: { photoDate: "desc" } },
        sessionLogs: { orderBy: { sessionDate: "desc" } },
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
});
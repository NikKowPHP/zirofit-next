import { addClient, updateClient, deleteClient } from "./client-actions";
import * as clientService from "@/lib/services/clientService";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prismaMock } from "../../../../tests/singleton";
import { revalidatePath } from "next/cache";

jest.mock("@/lib/services/clientService");
jest.mock("@/lib/supabase/server");
jest.mock("next/navigation");
jest.mock("next/cache");

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
};
(createSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase);

describe("Client Actions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addClient", () => {
    it("should create a client and redirect on valid data", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });
      prismaMock.user.findUnique.mockResolvedValue({ id: "user-1" } as any);
      (clientService.createClient as jest.Mock).mockResolvedValue({
        id: "client-1",
      });

      const formData = new FormData();
      formData.append("name", "Test Client");
      formData.append("email", "test@client.com");
      formData.append("phone", "1234567890");
      formData.append("status", "active");

      await addClient(undefined, formData);

      expect(clientService.createClient).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/clients");
      expect(redirect).toHaveBeenCalledWith("/clients");
    });

    it("should return validation errors for invalid form data", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });
      prismaMock.user.findUnique.mockResolvedValue({ id: "user-1" } as any);
      const formData = new FormData();
      formData.append("name", ""); // Invalid name
      formData.append("email", "not-an-email"); // Invalid email
      formData.append("phone", ""); // Invalid phone
      formData.append("status", "active");

      const result = await addClient(undefined, formData);

      expect(clientService.createClient).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
      expect(result.errors).toBeDefined();
      expect(result.errors?.name).toBeDefined();
      expect(result.errors?.email).toBeDefined();
      expect(result.errors?.phone).toBeDefined();
    });
  });

  describe("updateClient", () => {
    it("should update a client and redirect on success", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });
      (clientService.getClientForTrainer as jest.Mock).mockResolvedValue({
        id: "client-1",
        trainerId: "user-1",
      });

      const formData = new FormData();
      formData.append("id", "client-1");
      formData.append("name", "Updated Client");
      formData.append("email", "updated@client.com");
      formData.append("phone", "0987654321");
      formData.append("status", "inactive");

      await updateClient(undefined, formData);

      expect(clientService.updateClientById).toHaveBeenCalledWith(
        "client-1",
        expect.any(Object),
      );
      expect(revalidatePath).toHaveBeenCalledWith("/clients");
      expect(redirect).toHaveBeenCalledWith("/clients");
    });
  });

  describe("deleteClient", () => {
    it("should delete a client and revalidate on success", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });
      (clientService.getClientForTrainer as jest.Mock).mockResolvedValue({
        id: "client-1",
        trainerId: "user-1",
      });

      const result = await deleteClient("client-1");

      expect(clientService.deleteClientById).toHaveBeenCalledWith("client-1");
      expect(revalidatePath).toHaveBeenCalledWith("/clients");
      expect(result.message).toBe("Client deleted.");
    });
  });
});
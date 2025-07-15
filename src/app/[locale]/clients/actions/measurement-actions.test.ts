import {
  addMeasurement,
  updateMeasurement,
  deleteMeasurement,
} from "./measurement-actions";
import * as clientService from "@/lib/services/clientService";
import * as utils from "./_utils";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

jest.mock("@/lib/services/clientService");
jest.mock("./_utils");
jest.mock("@/lib/supabase/server");
jest.mock("next/cache");

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
};
(createClient as jest.Mock).mockResolvedValue(mockSupabase);
(utils.authorizeClientAccess as jest.Mock).mockResolvedValue(true);

describe("Measurement Actions", () => {
  const authUser = { id: "user-1" };
  const clientId = "client-1";
  const measurementId = "measurement-1";

  beforeEach(() => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: authUser } });
    jest.clearAllMocks();
  });

  describe("addMeasurement", () => {
    it("should add a measurement and revalidate path", async () => {
      const formData = new FormData();
      formData.append("clientId", clientId);
      formData.append("measurementDate", new Date().toISOString());
      formData.append("weightKg", "80.5");
      (clientService.createMeasurement as jest.Mock).mockResolvedValue({
        id: measurementId,
      });

      const result = await addMeasurement(undefined, formData);

      expect(clientService.createMeasurement).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith(`/clients/${clientId}`);
      expect(result.success).toBe(true);
    });
  });

  describe("updateMeasurement", () => {
    it("should update a measurement and revalidate path", async () => {
      const formData = new FormData();
      formData.append("measurementId", measurementId);
      formData.append("clientId", clientId);
      formData.append("measurementDate", new Date().toISOString());
      formData.append("weightKg", "81");
      (clientService.updateMeasurementById as jest.Mock).mockResolvedValue({
        id: measurementId,
      });

      const result = await updateMeasurement(undefined, formData);

      expect(clientService.updateMeasurementById).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith(`/clients/${clientId}`);
      expect(result.success).toBe(true);
    });
  });

  describe("deleteMeasurement", () => {
    it("should delete a measurement and revalidate path", async () => {
      (clientService.findMeasurementById as jest.Mock).mockResolvedValue({
        clientId: clientId,
      });

      const result = await deleteMeasurement({}, measurementId);

      expect(clientService.deleteMeasurementById).toHaveBeenCalledWith(
        measurementId,
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/clients/${clientId}`);
      expect(result.success).toBe(true);
    });
  });
});
import {
  addExerciseLog,
  updateExerciseLog,
  deleteExerciseLog,
  searchExercisesAction,
} from "./exercise-log-actions";
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
const mockAuthorizeClientAccess = utils.authorizeClientAccess as jest.Mock;

describe("Exercise Log Actions", () => {
  const authUser = { id: "user-1" };
  const clientId = "client-1";
  const logId = "log-1";

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: authUser } });
    mockAuthorizeClientAccess.mockResolvedValue(true);
  });

  describe("addExerciseLog", () => {
    const formData = new FormData();
    formData.append("clientId", clientId);
    formData.append("exerciseId", "ex-1");
    formData.append("logDate", new Date().toISOString().split("T")[0]);
    formData.append("sets", JSON.stringify([{ reps: 10, weight: 100 }]));

    it("should add a log and revalidate path on success", async () => {
      (clientService.createExerciseLog as jest.Mock).mockResolvedValue({
        id: logId,
      });

      const result = await addExerciseLog(undefined, formData);

      expect(clientService.createExerciseLog).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith(`/clients/${clientId}`);
      expect(result.success).toBe(true);
      expect(result.newLog).toBeDefined();
    });

    it("should return validation error for invalid data", async () => {
      const invalidFormData = new FormData();
      invalidFormData.append("clientId", clientId);
      invalidFormData.append("exerciseId", ""); // invalid
      invalidFormData.append("logDate", "invalid-date"); // invalid
      invalidFormData.append("sets", "[]"); // invalid

      const result = await addExerciseLog(undefined, invalidFormData);

      expect(clientService.createExerciseLog).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should return auth error if client access is denied", async () => {
      mockAuthorizeClientAccess.mockResolvedValue(false);
      const result = await addExerciseLog(undefined, formData);
      expect(clientService.createExerciseLog).not.toHaveBeenCalled();
      expect(result.error).toBe("Unauthorized access to client.");
    });

    it("should return auth error if user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      const result = await addExerciseLog(undefined, formData);
      expect(clientService.createExerciseLog).not.toHaveBeenCalled();
      expect(result.error).toBe("User not authenticated.");
    });
  });

  describe("updateExerciseLog", () => {
    const formData = new FormData();
    formData.append("logId", logId);
    formData.append("clientId", clientId);
    formData.append("exerciseId", "ex-1");
    formData.append("logDate", new Date().toISOString().split("T")[0]);
    formData.append("sets", JSON.stringify([{ reps: 12, weight: 110 }]));

    it("should update a log and revalidate path on success", async () => {
      (clientService.updateExerciseLog as jest.Mock).mockResolvedValue({
        id: logId,
      });

      const result = await updateExerciseLog(undefined, formData);

      expect(clientService.updateExerciseLog).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith(`/clients/${clientId}`);
      expect(result.success).toBe(true);
      expect(result.updatedLog).toBeDefined();
    });

    it("should fail for invalid data", async () => {
      const invalidFormData = new FormData();
      invalidFormData.append("logId", logId);
      invalidFormData.append("clientId", clientId);
      invalidFormData.append("exerciseId", "ex-1");
      invalidFormData.append("logDate", "not-a-date");
      invalidFormData.append("sets", "not-json");

      const result = await updateExerciseLog(undefined, invalidFormData);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe("deleteExerciseLog", () => {
    it("should delete a log and revalidate path on success", async () => {
      (clientService.findExerciseLogById as jest.Mock).mockResolvedValue({
        clientId: clientId,
      });
      (clientService.deleteExerciseLog as jest.Mock).mockResolvedValue({});

      const result = await deleteExerciseLog(logId);

      expect(clientService.deleteExerciseLog).toHaveBeenCalledWith(logId);
      expect(revalidatePath).toHaveBeenCalledWith(`/clients/${clientId}`);
      expect(result.success).toBe(true);
      expect(result.deletedId).toBe(logId);
    });

    it("should return auth error if log does not belong to user's client", async () => {
      (clientService.findExerciseLogById as jest.Mock).mockResolvedValue({
        clientId: "other-client",
      });
      mockAuthorizeClientAccess.mockResolvedValue(false);

      const result = await deleteExerciseLog(logId);

      expect(clientService.deleteExerciseLog).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toContain("Unauthorized");
    });
  });

  describe("searchExercisesAction", () => {
    it("should call clientService.searchExercises", async () => {
      const query = "squat";
      (clientService.searchExercises as jest.Mock).mockResolvedValue([
        { id: "ex-1", name: "Barbell Squat" },
      ]);

      const result = await searchExercisesAction(query);

      expect(clientService.searchExercises).toHaveBeenCalledWith(query);
      expect(result.exercises).toHaveLength(1);
      expect(result.exercises[0].name).toBe("Barbell Squat");
    });
  });
});
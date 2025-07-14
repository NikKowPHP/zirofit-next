import {
  addSessionLog,
  updateSessionLog,
  deleteSessionLog,
} from "./log-actions";
import * as clientService from "@/lib/services/clientService";
import * as notificationService from "@/lib/services/notificationService";
import * as utils from "./_utils";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

jest.mock("@/lib/services/clientService");
jest.mock("@/lib/services/notificationService");
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

describe("Session Log Actions", () => {
  const authUser = { id: "user-1" };
  const clientId = "client-1";
  const sessionLogId = "log-1";

  beforeEach(() => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: authUser } });
    jest.clearAllMocks();
  });

  describe("addSessionLog", () => {
    it("should add a log, create notification, and revalidate path", async () => {
      const formData = new FormData();
      formData.append("clientId", clientId);
      formData.append("sessionDate", new Date().toISOString());
      formData.append("durationMinutes", "60");
      formData.append("activitySummary", "Great session");

      (clientService.createSessionLog as jest.Mock).mockResolvedValue({
        id: sessionLogId,
      });

      const result = await addSessionLog({ success: false }, formData);

      expect(clientService.createSessionLog).toHaveBeenCalled();
      expect(notificationService.createMilestoneNotification).toHaveBeenCalledWith(
        authUser.id,
        clientId,
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/clients/${clientId}`);
      expect(result.success).toBe(true);
      expect(result.sessionLog).toBeDefined();
    });
  });

  describe("updateSessionLog", () => {
    it("should update a log and revalidate path", async () => {
      const formData = new FormData();
      formData.append("sessionLogId", sessionLogId);
      formData.append("clientId", clientId);
      formData.append("sessionDate", new Date().toISOString());
      formData.append("durationMinutes", "55");
      formData.append("activitySummary", "Updated summary");

      (clientService.updateSessionLogById as jest.Mock).mockResolvedValue({
        id: sessionLogId,
      });

      const result = await updateSessionLog({ success: false }, formData);

      expect(clientService.updateSessionLogById).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith(`/clients/${clientId}`);
      expect(result.success).toBe(true);
    });
  });

  describe("deleteSessionLog", () => {
    it("should delete a log and revalidate path", async () => {
      (clientService.findSessionLogById as jest.Mock).mockResolvedValue({
        clientId: clientId,
      });

      const result = await deleteSessionLog(sessionLogId);

      expect(clientService.deleteSessionLogById).toHaveBeenCalledWith(
        sessionLogId,
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/clients/${clientId}`);
      expect(result.success).toBe(true);
    });
  });
});
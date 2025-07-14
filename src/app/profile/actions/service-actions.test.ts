import { addService } from "./service-actions";
import * as utils from "./_utils";
import * as profileService from "@/lib/services/profileService";

jest.mock("./_utils");
jest.mock("@/lib/services/profileService");

describe("Service Actions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addService", () => {
    it("should return validation errors for invalid form data", async () => {
      (utils.getUserAndProfile as jest.Mock).mockResolvedValue({
        profile: { id: "profile-1" },
      });

      const formData = new FormData();
      formData.append("title", ""); // Invalid: empty title
      formData.append("description", ""); // Invalid: empty description

      const result = await addService(undefined, formData);

      expect(profileService.createService).not.toHaveBeenCalled();
      expect(result.errors).toBeDefined();
      expect(result.errors?.some((e) => e.path?.includes("title"))).toBe(true);
      expect(
        result.errors?.some((e) => e.path?.includes("description")),
      ).toBe(true);
    });
  });
});
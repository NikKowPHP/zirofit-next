import {
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "./testimonial-actions";
import * as utils from "./_utils";
import * as profileService from "@/lib/services/profileService";
import { revalidatePath } from "next/cache";

jest.mock("./_utils");
jest.mock("@/lib/services/profileService");
jest.mock("next/cache");

describe("Testimonial Actions", () => {
  beforeEach(() => {
    (utils.getUserAndProfile as jest.Mock).mockResolvedValue({
      profile: { id: "profile-1" },
    });
    jest.clearAllMocks();
  });

  describe("addTestimonial", () => {
    it("should add a testimonial on valid data", async () => {
      const formData = new FormData();
      formData.append("clientName", "A Happy Client");
      formData.append("testimonialText", "This trainer is the best!");
      (profileService.createTestimonial as jest.Mock).mockResolvedValue({
        id: "test-1",
      });

      const result = await addTestimonial(undefined, formData);

      expect(profileService.createTestimonial).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/profile/edit");
      expect(result.success).toBe(true);
      expect(result.newTestimonial).toBeDefined();
    });

    it("should return validation error on invalid data", async () => {
      const formData = new FormData();
      formData.append("clientName", "");
      formData.append("testimonialText", "");

      const result = await addTestimonial(undefined, formData);

      expect(profileService.createTestimonial).not.toHaveBeenCalled();
      expect(result.success).toBeUndefined();
      expect(result.error).toBe("Validation failed");
    });
  });

  describe("updateTestimonial", () => {
    it("should update a testimonial", async () => {
      const formData = new FormData();
      formData.append("clientName", "Updated Name");
      formData.append("testimonialText", "Updated text.");
      (profileService.updateTestimonial as jest.Mock).mockResolvedValue({
        id: "test-1",
      });

      const result = await updateTestimonial("test-1", undefined, formData);

      expect(profileService.updateTestimonial).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/profile/edit");
      expect(result.success).toBe(true);
    });
  });

  describe("deleteTestimonial", () => {
    it("should delete a testimonial", async () => {
      (profileService.deleteTestimonial as jest.Mock).mockResolvedValue({
        id: "test-1",
      });

      const result = await deleteTestimonial("test-1");

      expect(profileService.deleteTestimonial).toHaveBeenCalledWith(
        "test-1",
        "profile-1",
      );
      expect(revalidatePath).toHaveBeenCalledWith("/profile/edit");
      expect(result.success).toBe(true);
    });
  });
});
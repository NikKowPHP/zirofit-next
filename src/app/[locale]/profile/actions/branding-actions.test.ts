import { updateBrandingImages } from "./branding-actions";
import * as utils from "./_utils";
import * as profileService from "@/lib/services/profileService";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

jest.mock("./_utils");
jest.mock("@/lib/services/profileService");
jest.mock("@/lib/supabase/server");
jest.mock("next/cache");

const mockSupabase = {
  storage: {
    from: jest.fn().mockReturnThis(),
    upload: jest.fn(),
  },
};
(createClient as jest.Mock).mockResolvedValue(mockSupabase);

describe("Profile Branding Actions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("updateBrandingImages", () => {
    it("should upload images and update profile paths", async () => {
      (utils.getUserAndProfile as jest.Mock).mockResolvedValue({
        profile: { id: "profile-1" },
        authUser: { id: "user-1" },
      });
      mockSupabase.storage
        .from("zirofit")
        .upload.mockResolvedValue({ error: null });

      const formData = new FormData();
      formData.append("bannerImage", new Blob(["banner"]), "banner.jpg");
      formData.append("profilePhoto", new Blob(["photo"]), "photo.jpg");

      const result = await updateBrandingImages(undefined, formData);

      expect(mockSupabase.storage.from("zirofit").upload).toHaveBeenCalledTimes(
        2,
      );
      expect(profileService.updateBrandingPaths).toHaveBeenCalledWith(
        "profile-1",
        {
          bannerImagePath: expect.any(String),
          profilePhotoPath: expect.any(String),
        },
      );
      expect(revalidatePath).toHaveBeenCalledWith("/profile/edit");
      expect(result.success).toBe(true);
    });

    it("should handle only one image being uploaded", async () => {
      (utils.getUserAndProfile as jest.Mock).mockResolvedValue({
        profile: { id: "profile-1" },
        authUser: { id: "user-1" },
      });
      mockSupabase.storage
        .from("zirofit")
        .upload.mockResolvedValue({ error: null });

      const formData = new FormData();
      formData.append("bannerImage", new Blob(["banner"]), "banner.jpg");
      // No profile photo
      formData.append("profilePhoto", new Blob([]), "");

      const result = await updateBrandingImages(undefined, formData);

      expect(mockSupabase.storage.from("zirofit").upload).toHaveBeenCalledTimes(
        1,
      );
      expect(profileService.updateBrandingPaths).toHaveBeenCalledWith(
        "profile-1",
        {
          bannerImagePath: expect.any(String),
        },
      );
      expect(result.success).toBe(true);
    });
  });
});
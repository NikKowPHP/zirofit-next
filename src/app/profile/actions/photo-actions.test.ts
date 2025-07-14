import { addTransformationPhoto } from "./photo-actions";
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
    getPublicUrl: jest.fn(),
    remove: jest.fn(),
  },
};
(createClient as jest.Mock).mockResolvedValue(mockSupabase);

describe("Profile Photo Actions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addTransformationPhoto", () => {
    it("should upload a photo and create a db record on success", async () => {
      (utils.getUserAndProfile as jest.Mock).mockResolvedValue({
        profile: { id: "profile-1" },
        authUser: { id: "user-1" },
      });
      mockSupabase.storage
        .from("zirofit")
        .upload.mockResolvedValue({ error: null });
      mockSupabase.storage
        .from("zirofit")
        .getPublicUrl.mockReturnValue({
          data: { publicUrl: "http://public.url/photo.jpg" },
        });
      (profileService.createTransformationPhoto as jest.Mock).mockResolvedValue(
        { id: "photo-1", imagePath: "path/photo.jpg" },
      );

      const formData = new FormData();
      formData.append("photoFile", new Blob(["photo content"]), "photo.jpg");
      formData.append("caption", "A great transformation!");

      const result = await addTransformationPhoto(undefined, formData);

      expect(mockSupabase.storage.from("zirofit").upload).toHaveBeenCalled();
      expect(profileService.createTransformationPhoto).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/profile/edit");
      expect(result.success).toBe(true);
      expect(result.newPhoto).toBeDefined();
    });

    it("should return an error if storage upload fails", async () => {
      (utils.getUserAndProfile as jest.Mock).mockResolvedValue({
        profile: { id: "profile-1" },
        authUser: { id: "user-1" },
      });
      mockSupabase.storage
        .from("zirofit")
        .upload.mockResolvedValue({ error: { message: "Upload failed" } });

      const formData = new FormData();
      formData.append("photoFile", new Blob(["photo content"]), "photo.jpg");

      const result = await addTransformationPhoto(undefined, formData);

      expect(profileService.createTransformationPhoto).not.toHaveBeenCalled();
      expect(mockSupabase.storage.from("zirofit").remove).not.toHaveBeenCalled();
      expect(result.success).toBeUndefined();
      expect(result.error).toContain("Storage error: Upload failed");
    });
  });
});
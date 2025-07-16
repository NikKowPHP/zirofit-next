
"use server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/server";
import * as profileService from "@/lib/services/profileService";
import { getUserAndProfile } from "./_utils";

export interface BrandingFormState {
  messageKey?: string | null;
  error?: string | null;
  success?: boolean;
}

export async function updateBrandingImages(
  _prevState: BrandingFormState | undefined,
  formData: FormData,
): Promise<BrandingFormState> {
  const { profile, authUser } = await getUserAndProfile();
  const bannerImage = formData.get("bannerImage") as File;
  const profilePhoto = formData.get("profilePhoto") as File;

  const updates: { bannerImagePath?: string; profilePhotoPath?: string } = {};
  const supabaseStorage = await createClient();

  try {
    if (bannerImage?.size > 0) {
      const path = `profile-assets/${authUser.id}/banner-${uuidv4()}`;
      const { error } = await supabaseStorage.storage
        .from("zirofit")
        .upload(path, bannerImage, { upsert: true });
      if (error) throw new Error(`Banner upload failed: ${error.message}`);
      updates.bannerImagePath = path;
    }

    if (profilePhoto?.size > 0) {
      const path = `profile-assets/${authUser.id}/profile-photo-${uuidv4()}`;
      const { error } = await supabaseStorage.storage
        .from("zirofit")
        .upload(path, profilePhoto, { upsert: true });
      if (error) throw new Error(`Photo upload failed: ${error.message}`);
      updates.profilePhotoPath = path;
    }

    if (Object.keys(updates).length > 0) {
      await profileService.updateBrandingPaths(profile.id, updates);
    }

    revalidatePath("/profile/edit");
    return { success: true, messageKey: "brandingUpdated" };
  } catch (e: unknown) {
    return { error: `Failed to update branding: ${e instanceof Error ? e.message : String(e)}` };
  }
}
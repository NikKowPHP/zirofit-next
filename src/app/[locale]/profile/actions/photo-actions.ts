
"use server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import * as profileService from "@/lib/services/profileService";
import { getUserAndProfile } from "./_utils";
import type { TransformationPhotoWithPublicUrl } from "./_utils";

const TransformationPhotoSchema = z.object({
    caption: z.string().max(255).optional(),
    photoFile: z
        .any()
        .refine((file) => file?.size > 0, "Photo file is required.")
        .refine((file) => file?.size <= 2 * 1024 * 1024, `Max file size is 2MB.`),
});

export interface TransformationPhotoFormState {
    messageKey?: string | null;
    error?: string | null;
    errors?: z.ZodIssue[];
    success?: boolean;
    newPhoto?: TransformationPhotoWithPublicUrl;
    deletedId?: string;
}

export async function addTransformationPhoto(
    prevState: TransformationPhotoFormState | undefined,
    formData: FormData,
): Promise<TransformationPhotoFormState> {
    const { profile, authUser } = await getUserAndProfile();
    const validated = TransformationPhotoSchema.safeParse({
        caption: formData.get("caption"),
        photoFile: formData.get("photoFile"),
    });
    if (!validated.success)
        return { errors: validated.error.issues, error: "Validation failed." };

    const { caption, photoFile } = validated.data;
    const filePath = `transformation-photos/${authUser.id}/${uuidv4()}`;
    const supabaseStorage = await createClient();
    const { error: uploadError } = await supabaseStorage.storage
        .from("zirofit")
        .upload(filePath, photoFile);
    if (uploadError) return { error: `Storage error: ${uploadError.message}` };

    try {
        const {
            data: { publicUrl },
        } = supabaseStorage.storage.from("zirofit").getPublicUrl(filePath);
        const newPhoto = await profileService.createTransformationPhoto({ profileId: profile.id, imagePath: filePath, caption });
        revalidatePath("/profile/edit");
        return {
            success: true,
            messageKey: "photoUploaded",
            newPhoto: { ...newPhoto, publicUrl },
        };
    } catch (e: unknown) {
        await supabaseStorage.storage.from("zirofit").remove([filePath]);
        return { error: `Failed to save photo details: ${e instanceof Error ? e.message : String(e)}` };
    }
}

export async function deleteTransformationPhoto(
    photoId: string,
): Promise<{ success: boolean; error?: string; deletedId?: string, messageKey?: string }> {
    const { profile } = await getUserAndProfile();
    try {
        const photo = await profileService.findTransformationPhoto(photoId, profile.id);
        const supabase = await createClient();
        await supabase.storage.from("zirofit").remove([photo.imagePath]);
        await profileService.deleteTransformationPhoto(photoId);
        revalidatePath("/profile/edit");
        return { success: true, deletedId: photoId, messageKey: "photoDeleted" };
    } catch (e: unknown) {
        return { success: false, error: `Failed to delete photo: ${e instanceof Error ? e.message : String(e)}` };
    }
}
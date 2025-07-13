"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import * as clientService from "@/lib/services/clientService";
import { authorizeClientAccess } from "./_utils";

const ProgressPhotoSchema = z.object({
  clientId: z.string(),
  photoDate: z.string(),
  caption: z.string().optional(),
  photo: z.any(), // File type
});

export async function addProgressPhoto(prevState: any, formData: FormData) {
  const validatedFields = ProgressPhotoSchema.safeParse({
    clientId: formData.get("clientId"),
    photoDate: formData.get("photoDate"),
    caption: formData.get("caption"),
    photo: formData.get("photo"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to add progress photo.",
    };
  }

  const { clientId, photoDate, caption, photo } = validatedFields.data;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { message: "User not authenticated." };

  if (!(await authorizeClientAccess(clientId, authUser.id))) {
    return { message: "Client not found or unauthorized." };
  }

  const file = photo as File;
  const fileExt = file.name.split(".").pop();
  const fileName = `${clientId}-${Date.now()}.${fileExt}`;
  const filePath = `client_progress_photos/${authUser.id}/${clientId}/${fileName}`;

  const { error } = await supabase.storage
    .from("zirofit")
    .upload(filePath, file);
  if (error) {
    console.error("Supabase upload error:", error);
    return { message: "Failed to upload photo." };
  }

  try {
    const progressPhoto = await clientService.createProgressPhoto({
      clientId,
      photoDate: new Date(photoDate),
      caption,
      imagePath: filePath,
    });
    revalidatePath(`/clients/${clientId}`);
    return { success: true, progressPhoto };
  } catch (error: any) {
    return { message: "Failed to create progress photo." };
  }
}

export async function deleteProgressPhoto(prevState: any, photoId: string) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { message: "User not authenticated." };

  try {
    const photo = await clientService.findProgressPhotoById(photoId);
    if (!photo || !(await authorizeClientAccess(photo.clientId, authUser.id))) {
      return { message: "Unauthorized to delete photo." };
    }

    await supabase.storage.from("zirofit").remove([photo.imagePath]);
    await clientService.deleteProgressPhotoById(photoId);

    revalidatePath(`/clients/${photo.clientId}`);
    return { success: true, message: "Progress photo deleted." };
  } catch (error: any) {
    return { message: "Failed to delete progress photo." };
  }
}
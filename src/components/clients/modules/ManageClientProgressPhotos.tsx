"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { addProgressPhoto, deleteProgressPhoto } from "@/app/clients/actions/photo-actions";

import { revalidatePath } from "next/cache";
import Image from "next/image";
import { ClientProgressPhoto } from "@/app/clients/actions";

interface ManageClientProgressPhotosProps {
  clientId: string;
  initialProgressPhotos: ClientProgressPhoto[]; // Corrected type
}

interface ActionState {
  errors?: {
    photoDate?: string[];
    caption?: string[];
    photo?: string[];
    form?: string[];
  };
  message: string;
  success?: boolean;
  progressPhoto?: ClientProgressPhoto; // Corrected type
}

export default function ManageClientProgressPhotos({ clientId, initialProgressPhotos }: ManageClientProgressPhotosProps) {
  const [progressPhotos, setProgressPhotos] = useState<ClientProgressPhoto[]>(initialProgressPhotos); // Corrected type
  const initialActionState: ActionState = { message: "" };

  const addPhotoActionWrapper = async (state: ActionState, formData: FormData): Promise<ActionState> => {
    const result = await addProgressPhoto(state, formData);
    if (result?.success && result.progressPhoto) {
      // The type now correctly matches the object returned by the server action
      return { ...state, success: true, progressPhoto: result.progressPhoto, message: "" };
    } else {
      return { ...state, errors: result?.errors, message: result?.message || "Failed to add progress photo" };
    }
  };

  const deletePhotoActionWrapper = async (state: ActionState, photoId: string): Promise<ActionState> => {
    const result = await deleteProgressPhoto(state, photoId);
    if (result?.success) {
      return { ...state, success: true, message: result.message };
    } else {
      return { ...state, message: result?.message || "Failed to delete progress photo" };
    }
  };

  const [addPhotoState, addPhotoAction] = useFormState<ActionState, FormData>(
    addPhotoActionWrapper,
    initialActionState
  );
  const [deletePhotoState, deletePhotoAction] = useFormState<ActionState, string>(
    deletePhotoActionWrapper,
    initialActionState
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = async (formData: FormData) => {
    await addPhotoAction(formData);
  };

  const handleDeletePhoto = async (photoId: string) => {
    await deletePhotoAction(photoId);
  };

  return (
    <div>
      <h2>Manage Progress Photos</h2>

      <form action={handleAddPhoto}>
        <input type="hidden" name="clientId" value={clientId} />
        <label>Photo Date:</label>
        <input type="date" name="photoDate" required />
        <label>Caption:</label>
        <input type="text" name="caption" />
        <label>Photo:</label>
        <input type="file" name="photo" accept="image/*" onChange={handleImageChange} required />
        {selectedImage && (
          <Image
            src={selectedImage}
            alt="Preview"
            width={200}
            height={200}
            style={{ maxWidth: "200px", maxHeight: "200px" }}
          />
        )}
        <button type="submit">Add Photo</button>
        {addPhotoState.errors?.form && (
          <p style={{ color: "red" }}>{addPhotoState.errors.form}</p>
        )}
      </form>

      <h3>Photo Gallery</h3>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {progressPhotos.map((photo) => (
          <div key={photo.id} style={{ margin: "10px", textAlign: "center" }}>
            <Image src={photo.imagePath} alt={photo.caption || ''} width={200} height={200} style={{ maxWidth: "200px", maxHeight: "200px" }} />
            <p>{photo.photoDate.toLocaleDateString()}</p>
            <p>{photo.caption}</p>
            <form action={() => handleDeletePhoto(photo.id)}>
              <button type="submit">Delete</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

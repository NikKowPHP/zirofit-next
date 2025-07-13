import { useState } from "react";
import { useActionState } from "react";
import {
  addProgressPhoto,
  deleteProgressPhoto,
} from "@/app/clients/actions/photo-actions";
import { ClientProgressPhoto } from "@/app/clients/actions";

interface ActionState {
  errors?: {
    photoDate?: string[];
    caption?: string[];
    photo?: string[];
    form?: string[];
  };
  message: string;
  success?: boolean;
  progressPhoto?: ClientProgressPhoto;
}

interface UseProgressPhotoManagerProps {
  initialProgressPhotos: ClientProgressPhoto[];
}

/**
 * Manages the state and actions for client progress photos.
 * @param {UseProgressPhotoManagerProps} props - The initial progress photos.
 * @returns An object containing state and handlers for photo management.
 */
export const useProgressPhotoManager = ({
  initialProgressPhotos,
}: UseProgressPhotoManagerProps) => {
  const [progressPhotos, setProgressPhotos] =
    useState<ClientProgressPhoto[]>(initialProgressPhotos);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const initialActionState: ActionState = { message: "" };

  const addPhotoActionWrapper = async (
    state: ActionState,
    formData: FormData,
  ): Promise<ActionState> => {
    const result = await addProgressPhoto(state, formData);
    if (result?.success && result.progressPhoto) {
      setProgressPhotos((prevPhotos) =>
        [...prevPhotos, result.progressPhoto!].sort(
          (a, b) =>
            new Date(b.photoDate).getTime() - new Date(a.photoDate).getTime(),
        ),
      );
      setSelectedImage(null); // Clear preview on success
      return {
        ...state,
        success: true,
        progressPhoto: result.progressPhoto,
        message: "",
      };
    } else {
      return {
        ...state,
        errors: result?.errors,
        message: result?.message || "Failed to add progress photo",
      };
    }
  };

  const deletePhotoActionWrapper = async (
    state: ActionState,
    photoId: string,
  ): Promise<ActionState> => {
    const result = await deleteProgressPhoto(state, photoId);
    if (result?.success) {
      setProgressPhotos((prevPhotos) =>
        prevPhotos.filter((photo) => photo.id !== photoId),
      );
      return { ...state, success: true, message: result.message };
    } else {
      return {
        ...state,
        message: result?.message || "Failed to delete progress photo",
      };
    }
  };

  const [addPhotoState, addPhotoAction] = useActionState<ActionState, FormData>(
    addPhotoActionWrapper,
    initialActionState,
  );
  const [deleteState, deletePhotoAction] = useActionState<ActionState, string>(
    deletePhotoActionWrapper,
    initialActionState,
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (window.confirm("Are you sure you want to delete this photo?")) {
      await deletePhotoAction(photoId);
    }
  };

  return {
    progressPhotos,
    selectedImage,
    addPhotoState,
    addPhotoAction,
    deleteState,
    handleImageChange,
    handleDelete,
  };
};

import { useState, useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import {
  addProgressPhoto,
  deleteProgressPhoto,
} from "@/app/[locale]/clients/actions/photo-actions";
import { ClientProgressPhoto } from "@/app/[locale]/clients/actions";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const initialActionState: ActionState = { message: "", success: false };

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
        message: "Photo added successfully.",
      };
    } else {
      return {
        ...state,
        success: false,
        errors: result?.errors,
        error: result?.message || "Failed to add progress photo",
      } as any;
    }
  };

  const [addPhotoState, addPhotoAction] = useFormState<ActionState, FormData>(
    addPhotoActionWrapper,
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
    const originalPhotos = progressPhotos;
    setIsDeleting(true);
    setProgressPhotos((prevPhotos) =>
      prevPhotos.filter((photo) => photo.id !== photoId),
    );
    
    try {
      const result = await deleteProgressPhoto({}, photoId);
      if (!result?.success) {
        if (isMounted.current) {
          setProgressPhotos(originalPhotos);
        }
      }
      return result;
    } catch (error) {
      console.error("Delete photo failed:", error);
      if (isMounted.current) {
        setProgressPhotos(originalPhotos);
      }
      return { success: false, message: "An unexpected error occurred." };
    } finally {
      if (isMounted.current) {
        setIsDeleting(false);
      }
    }
  };

  return {
    progressPhotos,
    selectedImage,
    addPhotoState,
    addPhotoAction,
    handleImageChange,
    handleDelete,
    isDeleting,
  };
};
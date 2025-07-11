"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import {
  addProgressPhoto,
  deleteProgressPhoto,
} from "@/app/clients/actions/photo-actions";
import { Button, Input } from "@/components/ui";
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

export default function ManageClientProgressPhotos({
  clientId,
  initialProgressPhotos,
}: ManageClientProgressPhotosProps) {
  const [progressPhotos, setProgressPhotos] = useState<ClientProgressPhoto[]>(
    initialProgressPhotos,
  ); // Corrected type
  const initialActionState: ActionState = { message: "" };

  const addPhotoActionWrapper = async (
    state: ActionState,
    formData: FormData,
  ): Promise<ActionState> => {
    const result = await addProgressPhoto(state, formData);
    if (result?.success && result.progressPhoto) {
      setProgressPhotos((prevPhotos) => [...prevPhotos, result.progressPhoto!].sort((a,b) => new Date(b.photoDate).getTime() - new Date(a.photoDate).getTime()));
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

  const [addPhotoState, addPhotoAction] = useFormState<ActionState, FormData>(
    addPhotoActionWrapper,
    initialActionState,
  );
  const [, deletePhotoAction] = useFormState<
    ActionState,
    string
  >(deletePhotoActionWrapper, initialActionState);
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

  const handleDeletePhoto = async (photoId: string) => {
    if(window.confirm('Are you sure you want to delete this photo?')) {
      await deletePhotoAction(photoId);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Manage Progress Photos
      </h2>

      <div>
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          Add New Photo
        </h3>
        <form action={addPhotoAction} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type="date" name="photoDate" required />
            <Input type="text" name="caption" placeholder="Caption (optional)" />
          </div>

          <div>
            <Input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {selectedImage && (
              <div className="mt-4 p-2 border rounded-md dark:border-neutral-700">
                <Image
                  src={selectedImage}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="object-contain max-h-48 w-auto mx-auto rounded-md"
                />
              </div>
            )}
          </div>

          <Button type="submit">Add Photo</Button>
          
          {addPhotoState.errors?.form && (
            <div className="mt-2 p-2 text-sm text-red-700 bg-red-50 rounded-lg dark:bg-red-200 dark:text-red-800">
              {addPhotoState.errors.form}
            </div>
          )}
        </form>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          Photo Gallery
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {progressPhotos.map((photo) => (
            <div key={photo.id} className="group relative">
              <div className="relative aspect-square mb-2">
                <Image
                  src={photo.imagePath}
                  alt={photo.caption || ""}
                  fill
                  className="object-cover rounded-md"
                />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <form action={() => handleDeletePhoto(photo.id)}>
                      <Button type="submit" variant="danger" size="sm">
                        Delete
                      </Button>
                    </form>
                  </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {photo.photoDate ? new Date(photo.photoDate).toLocaleDateString(): ''}
              </p>
              {photo.caption && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {photo.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

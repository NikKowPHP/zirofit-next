"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import {
  addProgressPhoto,
  deleteProgressPhoto,
} from "@/app/clients/actions/photo-actions";

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
  const [progressPhotos] = useState<ClientProgressPhoto[]>(
    initialProgressPhotos,
  ); // Corrected type
  const initialActionState: ActionState = { message: "" };

  const addPhotoActionWrapper = async (
    state: ActionState,
    formData: FormData,
  ): Promise<ActionState> => {
    const result = await addProgressPhoto(state, formData);
    if (result?.success && result.progressPhoto) {
      // The type now correctly matches the object returned by the server action
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

  const handleAddPhoto = async (formData: FormData) => {
    await addPhotoAction(formData);
  };

  const handleDeletePhoto = async (photoId: string) => {
    await deletePhotoAction(photoId);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Manage Progress Photos
      </h2>

      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          Add New Photo
        </h3>
        <form action={handleAddPhoto} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Photo Date
              </label>
              <input
                type="date"
                name="photoDate"
                required
                className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Caption
              </label>
              <input
                type="text"
                name="caption"
                className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Photo
            </label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-100 dark:hover:file:bg-indigo-800"
            />
            {selectedImage && (
              <div className="mt-4 p-2 border rounded-md dark:border-gray-700">
                <Image
                  src={selectedImage}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="object-contain max-h-48 w-auto mx-auto"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Add Photo
          </button>
          
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
            <div
              key={photo.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm"
            >
              <div className="relative aspect-square mb-4">
                <Image
                  src={photo.imagePath}
                  alt={photo.caption || ""}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {photo.photoDate.toLocaleDateString()}
              </p>
              {photo.caption && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {photo.caption}
                </p>
              )}
              <form
                action={() => handleDeletePhoto(photo.id)}
                className="mt-2 flex justify-end"
              >
                <button
                  type="submit"
                  className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

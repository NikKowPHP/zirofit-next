"use client";

import { useProgressPhotoManager } from "@/hooks/useProgressPhotoManager";
import { Button, Input } from "@/components/ui";
import Image from "next/image";
import { ClientProgressPhoto } from "@/app/clients/actions";

interface ManageClientProgressPhotosProps {
  clientId: string;
  initialProgressPhotos: ClientProgressPhoto[];
}

export default function ManageClientProgressPhotos({
  clientId,
  initialProgressPhotos,
}: ManageClientProgressPhotosProps) {
  const {
    progressPhotos,
    selectedImage,
    addPhotoState,
    addPhotoAction,
    handleImageChange,
    handleDelete,
  } = useProgressPhotoManager({ initialProgressPhotos });

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
                    <form action={() => handleDelete(photo.id)}>
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
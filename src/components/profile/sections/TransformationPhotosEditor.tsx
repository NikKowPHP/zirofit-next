"use client";

import React, { useEffect, useRef, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  addTransformationPhoto,
  deleteTransformationPhoto,
} from "@/app/profile/actions/photo-actions";
import { Input, Label, Textarea, Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import Image from "next/image";
import { z } from "zod";
import { TransformationImage } from "@/components/ui/ImageComponents";

export type TransformationPhoto = {
  id: string;
  imagePath: string;
  publicUrl: string;
  caption: string | null;
  createdAt: Date;
  updatedAt: Date;
  profileId: string;
};

interface TransformationPhotosEditorProps {
  initialTransformationPhotos: TransformationPhoto[];
}

interface TransformationPhotoFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newPhoto?: TransformationPhoto;
}

const initialState: TransformationPhotoFormState = {
  /* ... */
};

function SubmitPhotoButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Uploading..." : "Upload Photo"}
    </Button>
  );
}

export default function TransformationPhotosEditor({
  initialTransformationPhotos,
}: TransformationPhotosEditorProps) {
  const [state, formAction] = useActionState(
    addTransformationPhoto,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<TransformationPhoto[]>(
    initialTransformationPhotos,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (state.success && state.newPhoto) {
      setPhotos((current) =>
        [state.newPhoto!, ...current].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
      formRef.current?.reset();
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
    }
    if (
      initialTransformationPhotos !== photos &&
      !state.success &&
      !deletingId
    ) {
      setPhotos(initialTransformationPhotos);
    }
  }, [
    initialTransformationPhotos,
    state.success,
    deletingId,
    photos,
    state.newPhoto,
  ]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const getFieldError = (fieldName: "caption" | "photoFile") => {
    return state.errors?.find((err) => err.path && err.path.includes(fieldName))
      ?.message;
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    setDeletingId(photoId);
    setDeleteError(null);
    const result = await deleteTransformationPhoto(photoId);
    if (result.success && result.deletedId) {
      setPhotos((current) => current.filter((p) => p.id !== result.deletedId));
    } else if (result.error) {
      setDeleteError(result.error);
    }
    setDeletingId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Transformation Photos</CardTitle>
      </CardHeader>
      <CardContent>
        {state.success && state.message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {state.message}
          </div>
        )}
        {state.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {state.error}
          </div>
        )}
        <form
          action={formAction}
          ref={formRef}
          className="space-y-4 border-b dark:border-gray-700 pb-6 mb-6"
          encType="multipart/form-data"
        >
          <div>
            <Label htmlFor="photoFile">Photo File (Max 2MB)</Label>
            <Input
              id="photoFile"
              name="photoFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required
              className="mt-1"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {getFieldError("photoFile") && (
              <p className="text-red-500 text-xs mt-1">
                {getFieldError("photoFile")}
              </p>
            )}
          </div>
          {previewUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Preview:</p>
              <Image
                src={previewUrl}
                alt="Selected preview"
                width={200}
                height={200}
                className="max-h-48 w-auto rounded border"
              />
            </div>
          )}
          <div>
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Textarea id="caption" name="caption" rows={3} className="mt-1" />
            {getFieldError("caption") && (
              <p className="text-red-500 text-xs mt-1">
                {getFieldError("caption")}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <SubmitPhotoButton />
          </div>
        </form>

        {deleteError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {deleteError}
          </div>
        )}

        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
            Your Uploaded Photos
          </h4>
          {photos.length === 0 ? (
            <p className="text-gray-500">No photos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative border rounded-lg overflow-hidden shadow group transition-all duration-200"
                >
                  <TransformationImage
                    src={photo.imagePath}
                    alt={photo.caption || "Transformation photo"}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  {photo.caption && (
                    <p className="p-3 text-sm text-gray-600 bg-white/80 backdrop-blur-sm absolute bottom-0 left-0 right-0">
                      {photo.caption}
                    </p>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={deletingId === photo.id}
                      aria-label={`Delete photo: ${photo.caption || 'Transformation photo'}`}
                    >
                      {deletingId === photo.id ? (
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
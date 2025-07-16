
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  addTransformationPhoto,
  deleteTransformationPhoto,
} from "@/app/profile/actions/photo-actions";
import { Input, Label, Textarea, Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import Image from "next/image";
import { z } from "zod";
import { TransformationImage } from "@/components/ui/ImageComponents";
import { useServerActionToast } from "@/hooks/useServerActionToast";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { useTranslations } from "next-intl";

export type TransformationPhoto = {
  id: string;
  imagePath: string;
  publicUrl: string;
  caption: string | null;
  createdAt: Date;
  updatedAt: Date;
  profileId: string;
};

interface TransformationPhotoFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newPhoto?: TransformationPhoto;
}

const initialState: TransformationPhotoFormState = {
  success: false,
};

function SubmitPhotoButton() {
  const t = useTranslations("ProfileEditor");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t("photosUploading") : t("photosUploadButton")}
    </Button>
  );
}

interface TransformationPhotosEditorProps {
  initialTransformationPhotos: TransformationPhoto[];
}

export default function TransformationPhotosEditor({
  initialTransformationPhotos,
}: TransformationPhotosEditorProps) {
  const t = useTranslations("ProfileEditor");
  const t_server = useTranslations("ServerActions");
  const [state, formAction] = useFormState(
    addTransformationPhoto,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<TransformationPhoto[]>(
    initialTransformationPhotos,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useServerActionToast({
    formState: state,
    onSuccess: () => {
      formRef.current?.reset();
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  useEffect(() => {
    if (state.success && state.newPhoto) {
      setPhotos((current) =>
        [state.newPhoto!, ...current].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    }
  }, [state.success, state.newPhoto]);

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
    setDeletingId(photoId);
    const result = await deleteTransformationPhoto(photoId);
    if (result.success && result.messageKey && result.deletedId) {
      toast.success(t_server(result.messageKey));
      setPhotos((current) => current.filter((p) => p.id !== result.deletedId));
    } else if (result.error) {
      toast.error(result.error);
    }
    setDeletingId(null);
    setItemToDelete(null);
  };

  return (
    <>
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        setIsOpen={(isOpen) => !isOpen && setItemToDelete(null)}
        onConfirm={() => itemToDelete && handleDeletePhoto(itemToDelete)}
        isPending={!!deletingId}
        title={t("photosDeleteTitle")}
        description={t("photosDeleteDesc")}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t("photosTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={formAction}
            ref={formRef}
            className="space-y-4 border-b dark:border-gray-700 pb-6 mb-6"
            encType="multipart/form-data"
          >
            <div>
              <Label htmlFor="photoFile">{t("photosFileLabel")}</Label>
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
                <p className="text-sm text-gray-500 mb-1">{t("photosPreview")}</p>
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
              <Label htmlFor="caption">{t("photosCaptionLabel")}</Label>
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

          <div>
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
              {t("photosYourPhotos")}
            </h4>
            {photos.length === 0 ? (
              <p className="text-gray-500">{t("photosNone")}</p>
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
                        onClick={() => setItemToDelete(photo.id)}
                        disabled={deletingId === photo.id}
                        aria-label={`Delete photo: ${
                          photo.caption || "Transformation photo"
                        }`}
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
    </>
  );
}
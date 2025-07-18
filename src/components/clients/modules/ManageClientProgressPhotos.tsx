
"use client";

import { useProgressPhotoManager } from "@/hooks/useProgressPhotoManager";
import { Button, Input } from "@/components/ui";
import Image from "next/image";
import { ClientProgressPhoto } from "@/app/[locale]/clients/actions";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { useServerActionToast } from "@/hooks/useServerActionToast";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { transformImagePath } from "@/lib/utils";

interface ManageClientProgressPhotosProps {
  clientId: string;
  initialProgressPhotos: ClientProgressPhoto[];
}

function SubmitButton() {
  const t = useTranslations("ProfileEditor");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t("uploading") : t("photos_add")}
    </Button>
  );
}

export default function ManageClientProgressPhotos({
  clientId,
  initialProgressPhotos,
}: ManageClientProgressPhotosProps) {
  const t = useTranslations("Clients");
  const locale = useLocale();
  const {
    progressPhotos,
    selectedImage,
    addPhotoState,
    addPhotoAction,
    handleImageChange,
    handleDelete,
    isDeleting,
  } = useProgressPhotoManager({ initialProgressPhotos });

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useServerActionToast({ formState: addPhotoState });

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      const result = await handleDelete(itemToDelete);
      if (result?.success) {
        toast.success(result.message || t("photos_deleted"));
      } else {
        toast.error(result.message || t("photos_failDelete"));
      }
      setItemToDelete(null);
    }
  };

  return (
    <>
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        setIsOpen={(isOpen) => !isOpen && setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
        title={t("photos_deleteTitle")}
        description={t("photos_deleteDesc")}
      />

      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {t("photos_manage")}
        </h2>

        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
            {t("photos_addNew")}
          </h3>
          <form action={addPhotoAction} className="space-y-4">
            <input type="hidden" name="clientId" value={clientId} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input type="date" name="photoDate" required />
              <Input
                type="text"
                name="caption"
                placeholder={t("photos_caption")}
              />
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

            <SubmitButton />
          </form>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
            {t("photos_gallery")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {progressPhotos.map((photo) => (
              <div key={photo.id} className="group relative">
                <div className="relative aspect-square mb-2">
                  <Image
                    src={transformImagePath(photo.imagePath)}
                    alt={photo.caption || ""}
                    fill
                    className="object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setItemToDelete(photo.id)}
                      disabled={isDeleting}
                    >
                      {t("deleteButton")}
                    </Button>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {photo.photoDate
                    ? new Date(photo.photoDate).toLocaleDateString(locale)
                    : ""}
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
    </>
  );
}
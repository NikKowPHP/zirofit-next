
"use client";

import React, { useState } from "react";
import { useFormStatus } from "react-dom";
import { useEditableList } from "@/hooks/useEditableListManager";
import {
  addSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from "@/app/profile/actions/social-link-actions";
import { Input, Label, Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { useServerActionToast } from "@/hooks/useServerActionToast";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export interface SocialLink {
  id: string;
  profileId: string;
  platform: string;
  username: string;
  profileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SocialLinksEditorProps {
  initialSocialLinks: SocialLink[];
}

export default function SocialLinksEditor({
  initialSocialLinks,
}: SocialLinksEditorProps) {
  const t = useTranslations("ProfileEditor");
  const t_server = useTranslations("ServerActions");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const {
    items: links,
    editingItemId,
    deletingId,
    formRef,
    addState,
    addFormAction,
    updateState,
    updateFormAction,
    isEditing,
    currentEditingItem: currentEditingLink,
    handleEdit,
    handleCancelEdit,
    handleDelete,
  } = useEditableList<SocialLink>({
    initialItems: initialSocialLinks,
    addAction: addSocialLink,
    updateAction: updateSocialLink,
    deleteAction: deleteSocialLink,
  });

  const formStatus = useFormStatus();
  const currentFormState = isEditing ? updateState : addState;
  const getFieldError = (fieldName: "platform" | "username" | "profileUrl") => {
    return currentFormState.errors?.find(
      (err: any) => err.path && err.path.includes(fieldName),
    )?.message;
  };

  useServerActionToast({ formState: addState, onSuccess: () => formRef.current?.reset() });
  useServerActionToast({ formState: updateState, onSuccess: handleCancelEdit });

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      const result = await handleDelete(itemToDelete);
      if (result?.success && result.messageKey) {
        toast.success(t_server(result.messageKey));
      } else if (result?.error) {
        toast.error(result.error);
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
        isPending={!!deletingId}
        title={t("socialDeleteTitle")}
        description={t("socialDeleteDesc")}
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing
              ? t("socialLinksEditTitle", { platform: currentEditingLink?.platform })
              : t("socialLinksTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={isEditing ? updateFormAction : addFormAction}
            key={editingItemId || "add-link"}
            ref={formRef}
            className="space-y-4 border-b dark:border-gray-700 pb-6 mb-6"
          >
            {isEditing && (
              <input type="hidden" name="linkId" value={editingItemId ?? ""} />
            )}
            <div>
              <Label htmlFor="platform">{t("socialPlatform")}</Label>
              <Input
                id="platform"
                name="platform"
                type="text"
                required
                className="mt-1"
                defaultValue={currentEditingLink?.platform ?? ""}
              />
              {getFieldError("platform") && (
                <p className="text-red-500 text-xs mt-1">
                  {getFieldError("platform")}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="username">{t("socialUsername")}</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1"
                defaultValue={currentEditingLink?.username ?? ""}
              />
              {getFieldError("username") && (
                <p className="text-red-500 text-xs mt-1">
                  {getFieldError("username")}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="profileUrl">{t("socialProfileUrl")}</Label>
              <Input
                id="profileUrl"
                name="profileUrl"
                type="url"
                required
                className="mt-1"
                placeholder={t("socialProfileUrlPlaceholder")}
                defaultValue={currentEditingLink?.profileUrl ?? ""}
              />
              {getFieldError("profileUrl") && (
                <p className="text-red-500 text-xs mt-1">
                  {getFieldError("profileUrl")}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              {isEditing && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                >
                  {t("cancel")}
                </Button>
              )}
              <Button type="submit">
                {isEditing
                  ? formStatus.pending
                    ? t("saving")
                    : t("socialSaveButton")
                  : formStatus.pending
                    ? t("adding")
                    : t("socialAddButton")}
              </Button>
            </div>
          </form>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">
              {t("socialYourLinks")}
            </h4>
            {links.length === 0 ? (
              <p className="text-gray-500">{t("socialNone")}</p>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="p-3 bg-neutral-100 dark:bg-neutral-800/50 rounded-md flex justify-between items-center transition-all duration-200"
                  >
                    <div>
                      <span className="font-medium text-gray-700">
                        {link.platform}
                      </span>
                      : <span className="text-gray-600">@{link.username}</span>
                      <a
                        href={link.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline text-sm block truncate"
                      >
                        {link.profileUrl}
                      </a>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(link)}
                        disabled={
                          deletingId === link.id ||
                          (isEditing && editingItemId === link.id)
                        }
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setItemToDelete(link.id)}
                        disabled={deletingId === link.id}
                      >
                        <TrashIcon className="h-4 w-4" />
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
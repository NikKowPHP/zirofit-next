
"use client";

import React, { useState } from "react";
import { useFormStatus } from "react-dom";
import { useEditableList } from "@/hooks/useEditableListManager";
import {
  addExternalLink,
  updateExternalLink,
  deleteExternalLink,
} from "@/app/[locale]/profile/actions/external-link-actions";
import { Input, Label, Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { useServerActionToast } from "@/hooks/useServerActionToast";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ExternalLink {
  id: string;
  profileId: string;
  label: string;
  linkUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ExternalLinksEditorProps {
  initialExternalLinks: ExternalLink[];
}

export default function ExternalLinksEditor({
  initialExternalLinks,
}: ExternalLinksEditorProps) {
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
  } = useEditableList<ExternalLink>({
    initialItems: initialExternalLinks,
    addAction: addExternalLink,
    updateAction: updateExternalLink,
    deleteAction: deleteExternalLink,
  });

  const formStatus = useFormStatus();
  const currentFormState = isEditing ? updateState : addState;
  const getFieldError = (fieldName: "label" | "linkUrl") => {
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
        toast.success(t_server(result.messageKey as any));
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
        title={t("extLinksDeleteTitle")}
        description={t("extLinksDeleteDesc")}
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing
              ? t("extLinksEditTitle", { label: currentEditingLink?.label })
              : t("extLinksTitle")}
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
              <Label htmlFor="label">{t("extLinksLabel")}</Label>
              <Input
                id="label"
                name="label"
                type="text"
                required
                className="mt-1"
                defaultValue={currentEditingLink?.label ?? ""}
              />
              {getFieldError("label") && (
                <p className="text-red-500 text-xs mt-1">
                  {getFieldError("label")}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="linkUrl">{t("extLinksUrl")}</Label>
              <Input
                id="linkUrl"
                name="linkUrl"
                type="url"
                required
                className="mt-1"
                placeholder={t("extLinksUrlPlaceholder")}
                defaultValue={currentEditingLink?.linkUrl ?? ""}
              />
              {getFieldError("linkUrl") && (
                <p className="text-red-500 text-xs mt-1">
                  {getFieldError("linkUrl")}
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
                    : t("extLinksSaveButton")
                  : formStatus.pending
                    ? t("adding")
                    : t("extLinksAddButton")}
              </Button>
            </div>
          </form>

          <div>
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
              {t("extLinksYourLinks")}
            </h4>
            {links.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                {t("extLinksNone")}
              </p>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="p-3 bg-neutral-100 dark:bg-neutral-800/50 rounded-md flex justify-between items-center transition-all duration-200"
                  >
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {link.label}
                      </span>
                      :{" "}
                      <a
                        href={link.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline text-sm truncate"
                      >
                        {link.linkUrl}
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
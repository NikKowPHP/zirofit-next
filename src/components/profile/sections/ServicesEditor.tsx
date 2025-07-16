
"use client";

import React, { useState } from "react";
import { useFormStatus } from "react-dom";
import { useEditableList } from "@/hooks/useEditableListManager";
import {
  addService,
  deleteService,
  updateService,
} from "@/app/[locale]/profile/actions/service-actions";
import type { Service } from "@prisma/client";
import { Input, Label, Button, Card, CardHeader, CardTitle, CardContent, RichTextEditor } from "@/components/ui";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { useServerActionToast } from "@/hooks/useServerActionToast";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ServicesEditorProps {
  initialServices: Service[];
}

export default function ServicesEditor({
  initialServices,
}: ServicesEditorProps) {
  const t = useTranslations("ProfileEditor");
  const t_server = useTranslations("ServerActions");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const {
    items: services,
    editingItemId,
    deletingId,
    formRef,
    addState,
    addFormAction,
    updateState,
    updateFormAction,
    isEditing,
    currentEditingItem: currentEditingService,
    handleEdit,
    handleCancelEdit,
    handleDelete,
  } = useEditableList<Service>({
    initialItems: initialServices,
    addAction: addService,
    updateAction: updateService,
    deleteAction: deleteService,
  });

  useServerActionToast({ formState: addState, onSuccess: () => formRef.current?.reset() });
  useServerActionToast({ formState: updateState, onSuccess: handleCancelEdit });

  const formStatus = useFormStatus();
  const currentFormState = isEditing ? updateState : addState;
  const getFieldError = (fieldName: "title" | "description") => {
    return currentFormState.errors?.find(
      (err: any) => err.path && err.path.includes(fieldName),
    )?.message;
  };
  
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
        title={t("serviceDeleteTitle")}
        description={t("serviceDeleteDesc")}
      />
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? t("servicesEditTitle") : t("servicesTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={isEditing ? updateFormAction : addFormAction}
            key={editingItemId || "add"}
            ref={formRef}
            className="space-y-4 border-b dark:border-gray-700 pb-6 mb-6"
          >
            {isEditing && (
              <input type="hidden" name="serviceId" value={editingItemId ?? ""} />
            )}
            <div>
              <Label htmlFor="title">{t("serviceTitleLabel")}</Label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={currentEditingService?.title ?? ""}
                className="mt-1"
              />
              {getFieldError("title") && (
                <p className="text-red-500 text-xs mt-1">
                  {getFieldError("title")}
                </p>
              )}
            </div>
            <div>
              <RichTextEditor
                label={t("serviceDescLabel")}
                name="description"
                initialValue={currentEditingService?.description ?? ""}
              />
              {getFieldError("description") && (
                <p className="text-red-500 text-xs mt-1">
                  {getFieldError("description")}
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
                    : t("serviceSaveButton")
                  : formStatus.pending
                    ? t("adding")
                    : t("serviceAddButton")}
              </Button>
            </div>
          </form>

        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
            {t("serviceYourServices")}
          </h4>
          {services.length === 0 ? (
            <p className="text-gray-500">
              {t("serviceNone")}
            </p>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-md flex justify-between items-start transition-all duration-200"
                >
                  <div>
                    <h5 className="font-semibold text-gray-800 dark:text-gray-100">
                      {service.title}
                    </h5>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: service.description }} />
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      aria-label={`Edit ${service.title}`}
                      disabled={
                        deletingId === service.id ||
                        (isEditing && editingItemId === service.id)
                      }
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setItemToDelete(service.id)}
                      aria-label={`Delete ${service.title}`}
                      disabled={deletingId === service.id}
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
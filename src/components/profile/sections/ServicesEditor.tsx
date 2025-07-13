"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { useEditableList } from "@/hooks/useEditableListManager";
import {
  addService,
  deleteService,
  updateService,
} from "@/app/profile/actions/service-actions";
import type { Service } from "@prisma/client";
import { Input, Label, Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface ServicesEditorProps {
  initialServices: Service[];
}

export default function ServicesEditor({
  initialServices,
}: ServicesEditorProps) {
  const {
    items: services,
    editingItemId,
    deletingId,
    deleteError,
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

  const formStatus = useFormStatus();
  const currentFormState = isEditing ? updateState : addState;
  const getFieldError = (fieldName: "title" | "description") => {
    return currentFormState.errors?.find(
      (err: any) => err.path && err.path.includes(fieldName),
    )?.message;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? `Edit Service` : "Add New Service"}</CardTitle>
      </CardHeader>
      <CardContent>
        {currentFormState.success && currentFormState.message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {currentFormState.message}
          </div>
        )}
        {currentFormState.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {currentFormState.error}
          </div>
        )}

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
            <Label htmlFor="title">Service Title</Label>
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
              label="Service Description"
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
                Cancel
              </Button>
            )}
            <Button type="submit">
              {isEditing
                ? formStatus.pending
                  ? "Saving..."
                  : "Save Changes"
                : formStatus.pending
                  ? "Adding..."
                  : "Add Service"}
            </Button>
          </div>
        </form>

      {deleteError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {deleteError}
        </div>
      )}

      <div>
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
          Your Services
        </h4>
        {services.length === 0 ? (
          <p className="text-gray-500">
            You haven't added any services yet.
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
                    onClick={() => handleDelete(service.id)}
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
  );
}
"use client";

import React, { useEffect, useRef, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  addService,
  deleteService,
  updateService,
} from "@/app/profile/actions/service-actions";
import type { Service } from "@prisma/client";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { z } from "zod";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface ServicesEditorProps {
  initialServices: Service[];
}

interface ServiceFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newService?: Service;
}

interface UpdateServiceFormState extends ServiceFormState {
  updatedService?: Service;
}

const initialAddState: ServiceFormState = {};
const initialUpdateState: UpdateServiceFormState = {};

export default function ServicesEditor({
  initialServices,
}: ServicesEditorProps) {
  const [addState, addFormAction] = useActionState(
    (state: ServiceFormState, formData: FormData) =>
      addService(state, formData),
    initialAddState,
  );
  const [updateState, updateFormAction] = useActionState(
    (state: UpdateServiceFormState, formData: FormData) =>
      updateService(state, formData),
    initialUpdateState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [services, setServices] = useState<Service[]>(initialServices);

  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formStatus = useFormStatus();

  useEffect(() => {
    if (addState.success && addState.newService) {
      setServices((currentServices) =>
        [addState.newService!, ...currentServices].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
      formRef.current?.reset();
    }
  }, [addState.success, addState.newService]);

  useEffect(() => {
    if (updateState.success && updateState.updatedService) {
      setServices((currentServices) =>
        currentServices.map((s) =>
          s.id === updateState.updatedService!.id
            ? updateState.updatedService!
            : s,
        ),
      );
      handleCancelEdit();
    }
  }, [updateState.success, updateState.updatedService]);

  useEffect(() => {
    if (
      initialServices !== services &&
      !addState.success &&
      !updateState.success &&
      !editingServiceId
    ) {
      setServices(initialServices);
    }
  }, [
    initialServices,
    addState.success,
    updateState.success,
    editingServiceId,
    services,
  ]);

  const handleEditClick = (service: Service) => {
    setEditingServiceId(service.id);
  };

  const handleCancelEdit = () => {
    setEditingServiceId(null);
  };

  const isEditing = !!editingServiceId;

  const currentFormState = isEditing ? updateState : addState;
  const getFieldError = (fieldName: "title" | "description") => {
    return currentFormState.errors?.find(
      (err) => err.path && err.path.includes(fieldName),
    )?.message;
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;
    setDeletingId(serviceId);
    setDeleteError(null);
    const result = await deleteService(serviceId);
    if (result.success && result.deletedId) {
      setServices((currentServices) =>
        currentServices.filter((s) => s.id !== result.deletedId),
      );
    } else if (result.error) {
      setDeleteError(result.error);
    }
    setDeletingId(null);
  };

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {isEditing ? `Edit Service` : "Add New Service"}
        </h3>
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
          key={editingServiceId || "add"}
          className="space-y-4 border-b dark:border-gray-700 pb-6 mb-6"
        >
          {isEditing && (
            <input type="hidden" name="serviceId" value={editingServiceId} />
          )}
          <div>
            <Label htmlFor="title">Service Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={
                isEditing
                  ? services.find((s) => s.id === editingServiceId)?.title
                  : ""
              }
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
              initialValue={
                isEditing
                  ? (services.find((s) => s.id === editingServiceId)
                      ?.description ?? "")
                  : ""
              }
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
      </div>

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
                className="p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-md flex justify-between items-start"
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
                    onClick={() => handleEditClick(service)}
                    aria-label={`Edit ${service.title}`}
                    disabled={
                      deletingId === service.id ||
                      (isEditing && editingServiceId === service.id)
                    }
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
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
    </div>
  );
}

"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { useEditableList } from "@/hooks/useEditableListManager";
import {
  addExternalLink,
  updateExternalLink,
  deleteExternalLink,
} from "@/app/profile/actions/external-link-actions";
import { Input, Label, Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

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
  const {
    items: links,
    editingItemId,
    deletingId,
    deleteError,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing
            ? `Edit Link: ${currentEditingLink?.label}`
            : "Add New External Link"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentFormState.success && currentFormState.message && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/50 p-4 mb-4">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
              {currentFormState.message}
            </h3>
          </div>
        )}
        {currentFormState.error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 mb-4">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
              {currentFormState.error}
            </h3>
          </div>
        )}
        
        <form
          action={isEditing ? updateFormAction : addFormAction}
          key={editingItemId || "add-link"}
          ref={formRef}
          className="space-y-4 border-b dark:border-gray-700 pb-6 mb-6"
        >
          {isEditing && (
            <input type="hidden" name="linkId" value={editingItemId} />
          )}
          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              name="label"
              type="text"
              required
              className="mt-1"
              defaultValue={isEditing && currentEditingLink ? currentEditingLink.label : ""}
            />
            {getFieldError("label") && (
              <p className="text-red-500 text-xs mt-1">
                {getFieldError("label")}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="linkUrl">URL</Label>
            <Input
              id="linkUrl"
              name="linkUrl"
              type="url"
              required
              className="mt-1"
              placeholder="https://example.com"
              defaultValue={isEditing && currentEditingLink ? currentEditingLink.linkUrl : ""}
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
                  : "Add Link"}
            </Button>
          </div>
        </form>

        {deleteError && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 mb-4">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
              {deleteError}
            </h3>
          </div>
        )}

        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
            Your External Links
          </h4>
          {links.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No external links added yet.
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
                      onClick={() => handleDelete(link.id)}
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
  );
}
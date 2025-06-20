"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  addExternalLink,
  updateExternalLink,
  deleteExternalLink,
} from "@/app/profile/actions";
import { Input, Label, Button } from "@/components/ui";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { z } from "zod";

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

interface ExternalLinkFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newLink?: ExternalLink;
  updatedLink?: ExternalLink;
}

const initialFormState: ExternalLinkFormState = {};

export default function ExternalLinksEditor({
  initialExternalLinks,
}: ExternalLinksEditorProps) {
  const [addState, addFormAction] = useFormState(
    addExternalLink,
    initialFormState,
  );
  const [updateState, updateFormAction] = useFormState(
    updateExternalLink,
    initialFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [links, setLinks] = useState<ExternalLink[]>(initialExternalLinks);

  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isEditing = !!editingLinkId;
  const currentEditingLink = isEditing
    ? links.find((link) => link.id === editingLinkId)
    : null;
  const formStatus = useFormStatus();

  // Effect for add link
  useEffect(() => {
    if (addState.success && addState.newLink) {
      setLinks((current) =>
        [addState.newLink!, ...current].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
      );
      formRef.current?.reset();
    }
  }, [addState.success, addState.newLink]);

  // Effect for update link
  useEffect(() => {
    if (updateState.success && updateState.updatedLink) {
      setLinks((current) =>
        current
          .map((link) =>
            link.id === updateState.updatedLink!.id
              ? updateState.updatedLink!
              : link,
          )
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
      );
      handleCancelEdit();
    }
  }, [updateState.success, updateState.updatedLink]);

  // Sync with initial props
  useEffect(() => {
    if (
      initialExternalLinks !== links &&
      !addState.success &&
      !updateState.success &&
      !deletingId &&
      !isEditing
    ) {
      setLinks(initialExternalLinks);
    }
  }, [
    initialExternalLinks,
    addState.success,
    updateState.success,
    deletingId,
    isEditing,
    links,
  ]);

  const handleEditClick = (link: ExternalLink) => setEditingLinkId(link.id);
  const handleCancelEdit = () => setEditingLinkId(null);

  const handleDeleteLink = async (linkId: string) => {
    if (!window.confirm("Are you sure?")) return;
    setDeletingId(linkId);
    setDeleteError(null);
    const result = await deleteExternalLink(linkId);
    if (result.success && result.deletedId) {
      setLinks((current) => current.filter((l) => l.id !== result.deletedId));
    } else if (result.error) {
      setDeleteError(result.error);
    }
    setDeletingId(null);
  };

  const currentFormState = isEditing ? updateState : addState;
  const getFieldError = (fieldName: "label" | "linkUrl") => {
    return currentFormState.errors?.find(
      (err) => err.path && err.path.includes(fieldName),
    )?.message;
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow-sm rounded-lg space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {isEditing
            ? `Edit Link: ${currentEditingLink?.label}`
            : "Add New External Link"}
        </h3>
        {currentFormState.success && currentFormState.message && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">{/* Success icon */}</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                  {currentFormState.message}
                </h3>
              </div>
            </div>
          </div>
        )}
        {currentFormState.error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">{/* Error icon */}</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  {currentFormState.error}
                </h3>
              </div>
            </div>
          </div>
        )}

        <form
          action={isEditing ? updateFormAction : addFormAction}
          key={editingLinkId || "add-link"}
          ref={formRef}
          className="space-y-4 border-b dark:border-gray-700 pb-6 mb-6"
        >
          {isEditing && (
            <input type="hidden" name="linkId" value={editingLinkId} />
          )}
          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              name="label"
              type="text"
              required
              className="mt-1"
              defaultValue={isEditing ? currentEditingLink?.label : ""}
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
              defaultValue={isEditing ? currentEditingLink?.linkUrl : ""}
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
      </div>

      {deleteError && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">{/* Error icon */}</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                {deleteError}
              </h3>
            </div>
          </div>
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
                className="p-3 border dark:border-gray-700 rounded-md flex justify-between items-center"
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
                    onClick={() => handleEditClick(link)}
                    disabled={
                      deletingId === link.id ||
                      (isEditing && editingLinkId === link.id)
                    }
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteLink(link.id)}
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
    </div>
  );
}

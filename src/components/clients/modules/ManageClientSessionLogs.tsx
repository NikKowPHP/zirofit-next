
"use client";

import { useSessionLogManager } from "@/hooks/useSessionLogManager";
import type { ClientSessionLog } from "@/app/[locale]/clients/actions";
import { Button, Input, Textarea } from "@/components/ui";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { useServerActionToast } from "@/hooks/useServerActionToast";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

interface ManageClientSessionLogsProps {
  clientId: string;
  initialSessionLogs: ClientSessionLog[];
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const t = useTranslations("Clients");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? isEditing
          ? t("clientForm_updating")
          : t("clientForm_creating")
        : isEditing
        ? t("logs_updateButton")
        : t("logs_addButton")}
    </Button>
  );
}

export default function ManageClientSessionLogs({
  clientId,
  initialSessionLogs,
}: ManageClientSessionLogsProps) {
  const t = useTranslations("Clients");
  const locale = useLocale();
  const {
    sessionLogs,
    editingSessionLogId,
    deletingId,
    formRef,
    addState,
    addAction,
    updateState,
    updateAction,
    isEditing,
    currentEditingLog,
    handleDelete,
    handleEdit,
    handleCancelEdit,
  } = useSessionLogManager({ initialSessionLogs, clientId });

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useServerActionToast({
    formState: addState,
    onSuccess: () => formRef.current?.reset(),
  });
  useServerActionToast({
    formState: updateState,
    onSuccess: handleCancelEdit,
  });

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      const result = await handleDelete(itemToDelete);
      if (result?.success) {
        toast.success(result.message || t("logs_deleted"));
      } else {
        toast.error(result?.message || t("logs_failDelete"));
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
        title={t("logs_deleteTitle")}
        description={t("logs_deleteDesc")}
      />
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {t("logs_manage")}
        </h2>

        {/* Add/Edit Session Log Form */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
            {isEditing && currentEditingLog
              ? t("logs_addEditTitle_edit", {
                  date: new Date(
                    currentEditingLog.sessionDate,
                  ).toLocaleDateString(locale),
                })
              : t("logs_addEditTitle_add")}
          </h3>
          <form
            ref={formRef}
            action={isEditing ? updateAction : addAction}
            className="space-y-4"
            key={editingSessionLogId || "add"}
          >
            <input type="hidden" name="clientId" value={clientId} />
            {isEditing && (
              <input
                type="hidden"
                name="sessionLogId"
                value={editingSessionLogId ?? ""}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                name="sessionDate"
                required
                defaultValue={
                  isEditing && currentEditingLog
                    ? new Date(currentEditingLog.sessionDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
              />
              <Input
                type="number"
                name="durationMinutes"
                placeholder={t("logs_duration")}
                required
                defaultValue={
                  isEditing && currentEditingLog
                    ? String(currentEditingLog.durationMinutes ?? "")
                    : ""
                }
              />
            </div>

            <Textarea
              name="activitySummary"
              placeholder={t("logs_summary")}
              required
              defaultValue={
                isEditing && currentEditingLog
                  ? currentEditingLog.activitySummary ?? ""
                  : ""
              }
            />
            <Textarea
              name="sessionNotes"
              placeholder={t("logs_privateNotes")}
              defaultValue={
                isEditing && currentEditingLog
                  ? currentEditingLog.sessionNotes ?? ""
                  : ""
              }
            />

            <div className="flex gap-2">
              <SubmitButton isEditing={isEditing} />
              {isEditing && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                >
                  {t("measurements_cancelButton")}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Session Log List */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
            {t("logs_history")}
          </h3>
          <div className="space-y-4">
            {sessionLogs.map((sessionLog) => (
              <div
                key={sessionLog.id}
                className="bg-neutral-100 dark:bg-neutral-800/50 rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 pt-2">
                    {new Date(sessionLog.sessionDate).toLocaleDateString(locale)} -{" "}
                    {sessionLog.durationMinutes} mins
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(sessionLog)}
                      disabled={!!deletingId}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => setItemToDelete(sessionLog.id)}
                      disabled={deletingId === sessionLog.id}
                    >
                      {deletingId === sessionLog.id ? (
                        "..."
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm">{t("logs_summary_label")}</p>
                  <p className="text-sm">{sessionLog.activitySummary}</p>
                </div>
                {sessionLog.sessionNotes && (
                  <div>
                    <p className="font-semibold text-sm">{t("logs_notes_label")}</p>
                    <p className="text-sm">{sessionLog.sessionNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
"use client";

import { useSessionLogManager } from "@/hooks/useSessionLogManager";
import type { ClientSessionLog } from "@/app/clients/actions";
import { Button, Input, Textarea } from "@/components/ui";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ManageClientSessionLogsProps {
  clientId: string;
  initialSessionLogs: ClientSessionLog[];
}

export default function ManageClientSessionLogs({
  clientId,
  initialSessionLogs,
}: ManageClientSessionLogsProps) {
  const {
    sessionLogs,
    editingSessionLogId,
    deletingId,
    deleteError,
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

  const currentFormState = isEditing ? updateState : addState;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Manage Session Logs
      </h2>

      {/* Add/Edit Session Log Form */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          {isEditing && currentEditingLog
            ? `Editing Log from ${new Date(currentEditingLog.sessionDate).toLocaleDateString()}`
            : "Add New Session Log"}
        </h3>
        <form
          ref={formRef}
          action={isEditing ? updateAction : addAction}
          className="space-y-4"
          key={editingSessionLogId || "add"}
        >
          <input type="hidden" name="clientId" value={clientId} />
          {isEditing && (
            <input type="hidden" name="sessionLogId" value={editingSessionLogId ?? ""} />
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
              placeholder="Duration (minutes)"
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
            placeholder="Activity Summary"
            required
            defaultValue={
              isEditing && currentEditingLog
                ? currentEditingLog.activitySummary ?? ""
                : ""
            }
          />
          <Textarea
            name="sessionNotes"
            placeholder="Private Session Notes"
            defaultValue={
              isEditing && currentEditingLog
                ? currentEditingLog.sessionNotes ?? ""
                : ""
            }
          />

          <div className="flex gap-2">
            <Button type="submit">
              {isEditing ? "Update Log" : "Add Session Log"}
            </Button>
            {isEditing && (
              <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </div>

          {currentFormState?.message && !currentFormState.success && (
            <div className="mt-2 p-2 text-sm text-red-700 bg-red-50 rounded-lg dark:bg-red-200 dark:text-red-800">
              {currentFormState.message}
            </div>
          )}
        </form>
      </div>

      {/* Session Log List */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          Session History
        </h3>
        {deleteError && (
          <p className="text-red-500 text-sm mb-2">{deleteError}</p>
        )}
        <div className="space-y-4">
          {sessionLogs.map((sessionLog) => (
            <div
              key={sessionLog.id}
              className="bg-neutral-100 dark:bg-neutral-800/50 rounded-lg p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 pt-2">
                  {new Date(sessionLog.sessionDate).toLocaleDateString()} -{" "}
                  {sessionLog.durationMinutes} mins
                </h4>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(sessionLog)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(sessionLog.id)}
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
                <p className="font-semibold text-sm">Summary:</p>
                <p className="text-sm">{sessionLog.activitySummary}</p>
              </div>
              {sessionLog.sessionNotes && (
                <div>
                  <p className="font-semibold text-sm">Notes:</p>
                  <p className="text-sm">{sessionLog.sessionNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
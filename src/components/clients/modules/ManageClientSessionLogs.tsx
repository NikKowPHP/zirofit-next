"use client";

import { useState, useRef, useEffect, useActionState } from "react";
import {
  addSessionLog,
  deleteSessionLog,
  updateSessionLog,
} from "@/app/clients/actions";
import type { ClientSessionLog } from "@/app/clients/actions";
import { Button, Input, Textarea } from "@/components/ui";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ManageClientSessionLogsProps {
  clientId: string;
  initialSessionLogs: ClientSessionLog[];
}

interface ActionState {
  errors?: {
    sessionDate?: string[];
    durationMinutes?: string[];
    activitySummary?: string[];
    sessionNotes?: string[];
    clientId?: string[];
    sessionLogId?: string[];
  };
  message?: string;
  success: boolean;
  sessionLog?: ClientSessionLog;
}

const initialActionState: ActionState = { success: false };

export default function ManageClientSessionLogs({
  clientId,
  initialSessionLogs,
}: ManageClientSessionLogsProps) {
  const [sessionLogs, setSessionLogs] =
    useState<ClientSessionLog[]>(initialSessionLogs);
  const [editingSessionLogId, setEditingSessionLogId] = useState<string | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [addState, addAction] = useActionState(addSessionLog, initialActionState);
  const [updateState, updateAction] = useActionState(
    updateSessionLog,
    initialActionState,
  );

  const isEditing = !!editingSessionLogId;

  useEffect(() => {
    if (addState.success && addState.sessionLog) {
      setSessionLogs((prev) =>
        [addState.sessionLog!, ...prev].sort(
          (a, b) =>
            new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
        ),
      );
      formRef.current?.reset();
    }
  }, [addState]);

  useEffect(() => {
    if (updateState.success && updateState.sessionLog) {
      setSessionLogs((prev) =>
        prev.map((log) =>
          log.id === updateState.sessionLog!.id ? updateState.sessionLog! : log,
        ),
      );
      setEditingSessionLogId(null);
    }
  }, [updateState]);

  const handleDeleteSessionLog = async (sessionLogId: string) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    setDeletingId(sessionLogId);
    setDeleteError(null);
    const result = await deleteSessionLog(sessionLogId);
    if (result?.success) {
      setSessionLogs((prev) => prev.filter((log) => log.id !== sessionLogId));
    } else {
      setDeleteError(result?.message || "Failed to delete log.");
    }
    setDeletingId(null);
  };

  const handleEditClick = (log: ClientSessionLog) => {
    setEditingSessionLogId(log.id);
  };

  const handleCancelEdit = () => {
    setEditingSessionLogId(null);
  };

  const currentFormState = isEditing ? updateState : addState;
  const currentEditingLog = isEditing
    ? sessionLogs.find((l) => l.id === editingSessionLogId)
    : null;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Manage Session Logs
      </h2>

      {/* Add/Edit Session Log Form */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          {isEditing
            ? `Editing Log from ${new Date(currentEditingLog!.sessionDate).toLocaleDateString()}`
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
            <input type="hidden" name="sessionLogId" value={editingSessionLogId} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              name="sessionDate"
              required
              defaultValue={
                isEditing
                  ? new Date(currentEditingLog!.sessionDate)
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
                isEditing ? String(currentEditingLog!.durationMinutes ?? "") : ""
              }
            />
          </div>

          <Textarea
            name="activitySummary"
            placeholder="Activity Summary"
            required
            defaultValue={isEditing ? currentEditingLog!.activitySummary ?? "" : ""}
          />
          <Textarea
            name="sessionNotes"
            placeholder="Private Session Notes"
            defaultValue={isEditing ? currentEditingLog!.sessionNotes ?? "" : ""}
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
                    onClick={() => handleEditClick(sessionLog)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteSessionLog(sessionLog.id)}
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
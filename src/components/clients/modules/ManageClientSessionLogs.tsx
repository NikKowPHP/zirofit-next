"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { addSessionLog, updateSessionLog, deleteSessionLog } from "@/app/clients/actions";
import { PrismaClient, ClientSessionLog } from "@prisma/client"; // Corrected import
import { revalidatePath } from "next/cache";

interface ManageClientSessionLogsProps {
  clientId: string;
  initialSessionLogs: ClientSessionLog[];
}

interface ActionState {
  errors?: {
    sessionDate?: string[];
    durationMinutes?: string[];
    activitySummary?: string[];
    notes?: string[];
    form?: string[];
  };
  message: string;
  success?: boolean;
  sessionLog?: ClientSessionLog;
}

export default function ManageClientSessionLogs({ clientId, initialSessionLogs }: ManageClientSessionLogsProps) {
  const [sessionLogs, setSessionLogs] = useState<ClientSessionLog[]>(initialSessionLogs);
  const initialActionState: ActionState = { message: "" };

  const addSessionLogActionWrapper = async (state: ActionState, formData: FormData): Promise<ActionState> => {
    const result = await addSessionLog(state, formData);
    if (result?.success && result.sessionLog) {
      return { ...state, success: true, sessionLog: result.sessionLog, message: "" };
    } else {
      return { ...state, errors: result?.errors, message: result?.message || "Failed to add session log" };
    }
  };

  const updateSessionLogActionWrapper = async (state: ActionState, formData: FormData): Promise<ActionState> => {
    const result = await updateSessionLog(state, formData);
    if (result?.success && result.sessionLog) {
      return { ...state, success: true, sessionLog: result.sessionLog, message: "" };
    } else {
      return { ...state, errors: result?.errors, message: result?.message || "Failed to update session log" };
    }
  };

  const deleteSessionLogActionWrapper = async (state: ActionState, sessionLogId: string): Promise<ActionState> => {
    const result = await deleteSessionLog(sessionLogId);
    if (result?.success) {
      return { ...state, success: true, message: result.message };
    } else {
      return { ...state, message: result?.message || "Failed to delete session log" };
    }
  };

  const [addSessionLogState, addSessionLogAction] = useFormState<ActionState, FormData>(
    addSessionLogActionWrapper,
    initialActionState
  );
  const [updateSessionLogState, updateSessionLogAction] = useFormState<ActionState, FormData>(
    updateSessionLogActionWrapper,
    initialActionState
  );
  const [deleteSessionLogState, deleteSessionLogAction] = useFormState<ActionState, string>(
    deleteSessionLogActionWrapper,
    initialActionState
  );

  const handleAddSessionLog = async (formData: FormData) => {
    await addSessionLogAction(formData);
  };

  const handleUpdateSessionLog = async (formData: FormData) => {
    await updateSessionLogAction(formData);
  };

  const handleDeleteSessionLog = async (sessionLogId: string) => {
    await deleteSessionLogAction(sessionLogId);
  };

  return (
    <div>
      <h2>Manage Session Logs</h2>

      {/* Add Session Log Form */}
      <form action={handleAddSessionLog}>
        <input type="hidden" name="clientId" value={clientId} />
        <label>Session Date:</label>
        <input type="date" name="sessionDate" required />
        <label>Duration (minutes):</label>
        <input type="number" name="durationMinutes" required />
        <label>Activity Summary:</label>
        <textarea name="activitySummary" required />
        <label>Notes:</label>
        <textarea name="notes" />
        <button type="submit">Add Session Log</button>
        {addSessionLogState.errors?.form && (
          <p style={{ color: "red" }}>{addSessionLogState.errors.form}</p>
        )}
      </form>

      {/* Session Log List */}
      <h3>Session Logs</h3>
      <ul>
        {sessionLogs.map((sessionLog) => (
          <li key={sessionLog.id}>
            {sessionLog.sessionDate.toLocaleDateString()} - {sessionLog.durationMinutes} minutes - {sessionLog.activitySummary}
            {/* Update Session Log Form */}
            <form action={handleUpdateSessionLog}>
              <input type="hidden" name="sessionLogId" value={sessionLog.id} />
              <input type="hidden" name="clientId" value={clientId} />
              <label>Session Date:</label>
              <input type="date" name="sessionDate" defaultValue={sessionLog.sessionDate.toISOString().split('T')[0]} required />
              <label>Duration (minutes):</label>
              <input type="number" name="durationMinutes" defaultValue={sessionLog.durationMinutes ?? ''} required />
              <label>Activity Summary:</label>
              <textarea name="activitySummary" defaultValue={sessionLog.activitySummary ?? ''} required />
              <label>Notes:</label>
              <textarea name="notes" defaultValue={sessionLog.sessionNotes ?? ''} />
              <button type="submit">Update Session Log</button>
              {updateSessionLogState.errors?.form && (
                <p style={{ color: "red" }}>{updateSessionLogState.errors.form}</p>
              )}
            </form>
            <form action={(id) => handleDeleteSessionLog(sessionLog.id)}>
              <button type="submit">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

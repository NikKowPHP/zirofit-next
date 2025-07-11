"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import {
  addSessionLog,
  ClientSessionLog,
  deleteSessionLog,
  updateSessionLog,
} from "@/app/clients/actions";
import { Button, Input, Textarea } from "@/components/ui";

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

export default function ManageClientSessionLogs({
  clientId,
  initialSessionLogs,
}: ManageClientSessionLogsProps) {
  const [sessionLogs, setSessionLogs] =
    useState<ClientSessionLog[]>(initialSessionLogs);
  const initialActionState: ActionState = { message: "" };

  const addSessionLogActionWrapper = async (
    state: ActionState,
    formData: FormData,
  ): Promise<ActionState> => {
    const result = await addSessionLog(state, formData);
    if (result?.success && result.sessionLog) {
      setSessionLogs((prevLogs) => [...prevLogs, result.sessionLog!].sort((a,b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()));
      return { ...result, message: "" };
    } else {
      return { ...result };
    }
  };

  const updateSessionLogActionWrapper = async (
    state: ActionState,
    formData: FormData,
  ): Promise<ActionState> => {
    const result = await updateSessionLog(state, formData);
    if (result?.success && result.sessionLog) {
      setSessionLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.id === result.sessionLog!.id ? result.sessionLog! : log,
        ),
      );
      return { ...result };
    } else {
      return { ...result };
    }
  };

  const deleteSessionLogActionWrapper = async (
    state: ActionState,
    sessionLogId: string,
  ): Promise<ActionState> => {
    const result = await deleteSessionLog(sessionLogId);
    if (result?.success) {
      setSessionLogs((prevLogs) =>
        prevLogs.filter((log) => log.id !== sessionLogId),
      );
      return { ...state, success: true, message: result.message };
    } else {
      return {
        ...state,
        message: result?.message || "Failed to delete session log",
      };
    }
  };

  const [addSessionLogState, addSessionLogAction] = useFormState<
    ActionState,
    FormData
  >(addSessionLogActionWrapper, initialActionState);
  
  const [, deleteSessionLogAction] = useFormState<
    ActionState,
    string
  >(deleteSessionLogActionWrapper, initialActionState);

  const handleDeleteSessionLog = async (sessionLogId: string) => {
    if(window.confirm('Are you sure you want to delete this log?')) {
        await deleteSessionLogAction(sessionLogId);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Manage Session Logs
      </h2>

      {/* Add Session Log Form */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          Add New Session Log
        </h3>
        <form action={addSessionLogAction} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type="date" name="sessionDate" required />
            <Input type="number" name="durationMinutes" placeholder="Duration (minutes)" required />
          </div>

          <Textarea name="activitySummary" placeholder="Activity Summary" required />
          <Textarea name="notes" placeholder="Private Session Notes" />

          <Button type="submit">Add Session Log</Button>
          
          {addSessionLogState.errors?.form && (
            <div className="mt-2 p-2 text-sm text-red-700 bg-red-50 rounded-lg dark:bg-red-200 dark:text-red-800">
              {addSessionLogState.errors.form}
            </div>
          )}
        </form>
      </div>

      {/* Session Log List */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          Session History
        </h3>
        <div className="space-y-4">
          {sessionLogs.map((sessionLog) => (
            <form
              key={sessionLog.id}
              action={updateSessionLogActionWrapper}
              className="bg-neutral-100 dark:bg-neutral-800/50 rounded-lg p-4 space-y-4"
            >
              <input type="hidden" name="sessionLogId" value={sessionLog.id} />
              <input type="hidden" name="clientId" value={clientId} />
              
              <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 pt-2">
                    {sessionLog.sessionDate.toLocaleDateString()}
                  </h4>
                  <Button type="button" variant="danger" size="sm" onClick={() => handleDeleteSessionLog(sessionLog.id)}>
                      Delete
                  </Button>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input type="date" name="sessionDate" defaultValue={sessionLog.sessionDate.toISOString().split("T")[0]} required />
                  <Input type="number" name="durationMinutes" defaultValue={sessionLog.durationMinutes ?? ""} required placeholder="Duration (minutes)"/>
              </div>

              <Textarea name="activitySummary" defaultValue={sessionLog.activitySummary ?? ""} required placeholder="Activity Summary" />
              <Textarea name="notes" defaultValue={sessionLog.sessionNotes ?? ""} placeholder="Private Session Notes" />

              <div className="flex justify-end space-x-2">
                <Button type="submit" size="sm">Update</Button>
              </div>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}

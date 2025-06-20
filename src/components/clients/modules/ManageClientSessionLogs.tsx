"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
// import { addSessionLog, updateSessionLog, deleteSessionLog, type ClientSessionLog } from "@/app/clients/actions/log-actions";
import {
  addSessionLog,
  ClientSessionLog,
  deleteSessionLog,
  updateSessionLog,
} from "@/app/clients/actions";

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
  const [sessionLogs] =
    useState<ClientSessionLog[]>(initialSessionLogs);
  const initialActionState: ActionState = { message: "" };

  const addSessionLogActionWrapper = async (
    state: ActionState,
    formData: FormData,
  ): Promise<ActionState> => {
    const result = await addSessionLog(state, formData);
    if (result?.success && result.sessionLog) {
      return {
        ...state,
        success: true,
        sessionLog: result.sessionLog,
        message: "",
      };
    } else {
      return {
        ...state,
        errors: result?.errors,
        message: result?.message || "Failed to add session log",
      };
    }
  };

  const updateSessionLogActionWrapper = async (
    state: ActionState,
    formData: FormData,
  ): Promise<ActionState> => {
    const result = await updateSessionLog(state, formData);
    if (result?.success && result.sessionLog) {
      return {
        ...state,
        success: true,
        sessionLog: result.sessionLog,
        message: "",
      };
    } else {
      return {
        ...state,
        errors: result?.errors,
        message: result?.message || "Failed to update session log",
      };
    }
  };

  const deleteSessionLogActionWrapper = async (
    state: ActionState,
    sessionLogId: string,
  ): Promise<ActionState> => {
    const result = await deleteSessionLog(sessionLogId);
    if (result?.success) {
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
  const [updateSessionLogState, updateSessionLogAction] = useFormState<
    ActionState,
    FormData
  >(updateSessionLogActionWrapper, initialActionState);
  const [, deleteSessionLogAction] = useFormState<
    ActionState,
    string
  >(deleteSessionLogActionWrapper, initialActionState);

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
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Manage Session Logs
      </h2>

      {/* Add Session Log Form */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          Add New Session Log
        </h3>
        <form action={handleAddSessionLog} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Session Date
              </label>
              <input
                type="date"
                name="sessionDate"
                required
                className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="durationMinutes"
                required
                className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Activity Summary
            </label>
            <textarea
              name="activitySummary"
              required
              className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              name="notes"
              className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Add Session Log
          </button>
          
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
            <div
              key={sessionLog.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {sessionLog.sessionDate.toLocaleDateString()}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Duration: {sessionLog.durationMinutes ?? "N/A"} minutes
                  </p>
                  {sessionLog.activitySummary && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {sessionLog.activitySummary}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <form action={() => handleDeleteSessionLog(sessionLog.id)}>
                    <button
                      type="submit"
                      className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>

              <form action={handleUpdateSessionLog} className="space-y-4">
                <input type="hidden" name="sessionLogId" value={sessionLog.id} />
                <input type="hidden" name="clientId" value={clientId} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Session Date
                    </label>
                    <input
                      type="date"
                      name="sessionDate"
                      defaultValue={
                        sessionLog.sessionDate.toISOString().split("T")[0]
                      }
                      required
                      className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="durationMinutes"
                      defaultValue={sessionLog.durationMinutes ?? ""}
                      required
                      className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Activity Summary
                  </label>
                  <textarea
                    name="activitySummary"
                    defaultValue={sessionLog.activitySummary ?? ""}
                    required
                    className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    defaultValue={sessionLog.sessionNotes ?? ""}
                    className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    Update
                  </button>
                </div>
                
                {updateSessionLogState.errors?.form && (
                  <div className="mt-2 p-2 text-sm text-red-700 bg-red-50 rounded-lg dark:bg-red-200 dark:text-red-800">
                    {updateSessionLogState.errors.form}
                  </div>
                )}
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

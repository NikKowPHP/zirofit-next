
import { useState, useRef, useEffect } from "react";
import { useFormState } from "react-dom";
import {
  addSessionLog,
  deleteSessionLog,
  updateSessionLog,
} from "@/app/[locale]/clients/actions";
import type { ClientSessionLog } from "@/app/[locale]/clients/actions";

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

interface UseSessionLogManagerProps {
  initialSessionLogs: ClientSessionLog[];
  clientId: string;
}

/**
 * Custom hook for managing client session logs.
 * Handles state for logs, editing, deleting, and server action integration.
 * @param {UseSessionLogManagerProps} props - The initial logs and client ID.
 * @returns An object with state and handlers for the session log management UI.
 */
export const useSessionLogManager = ({
  initialSessionLogs,
}: UseSessionLogManagerProps) => {
  const [sessionLogs, setSessionLogs] =
    useState<ClientSessionLog[]>(initialSessionLogs);
  const [editingSessionLogId, setEditingSessionLogId] = useState<string | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [addState, addAction] = useFormState(
    addSessionLog,
    initialActionState,
  );
  const [updateState, updateAction] = useFormState(
    updateSessionLog,
    initialActionState,
  );

  const isEditing = !!editingSessionLogId;

  useEffect(() => {
    if (addState.success && addState.sessionLog) {
      setSessionLogs((prev) =>
        [addState.sessionLog!, ...prev].sort(
          (a, b) =>
            new Date(b.sessionDate).getTime() -
            new Date(a.sessionDate).getTime(),
        ),
      );
    }
  }, [addState]);

  useEffect(() => {
    if (updateState.success && updateState.sessionLog) {
      setSessionLogs((prev) =>
        prev.map((log) =>
          log.id === updateState.sessionLog!.id ? updateState.sessionLog! : log,
        ),
      );
    }
  }, [updateState]);

  const handleDelete = async (sessionLogId: string) => {
    const originalLogs = sessionLogs;
    setDeletingId(sessionLogId);
    setSessionLogs((prev) => prev.filter((log) => log.id !== sessionLogId));
    
    try {
      const result = await deleteSessionLog(sessionLogId);
      if (!result?.success) {
        if (isMounted.current) {
          setSessionLogs(originalLogs);
        }
      }
      return result;
    } catch (error) {
      console.error("Delete session log failed:", error);
      if (isMounted.current) {
        setSessionLogs(originalLogs);
      }
      return { success: false, message: "An unexpected error occurred." };
    } finally {
      if (isMounted.current) {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (log: ClientSessionLog) => {
    setEditingSessionLogId(log.id);
  };

  const handleCancelEdit = () => {
    setEditingSessionLogId(null);
  };

  const currentEditingLog = isEditing
    ? sessionLogs.find((l) => l.id === editingSessionLogId)
    : null;

  return {
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
  };
};
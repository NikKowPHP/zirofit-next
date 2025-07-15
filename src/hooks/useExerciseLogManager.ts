
"use client";

import { useState, useRef, useEffect, useActionState } from "react";
import {
  addExerciseLog,
  updateExerciseLog,
  deleteExerciseLog,
  searchExercisesAction,
  type ExerciseLogFormState,
  type ClientExerciseLog,
  type Exercise,
} from "@/app/clients/actions/exercise-log-actions";
import { toast } from "sonner";

interface UseExerciseLogManagerProps {
  initialExerciseLogs: ClientExerciseLog[];
  clientId: string;
}

const initialActionState: ExerciseLogFormState = { success: false };

export const useExerciseLogManager = ({
  initialExerciseLogs,
}: UseExerciseLogManagerProps) => {
  const [logs, setLogs] = useState<ClientExerciseLog[]>(initialExerciseLogs);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [blockSearch, setBlockSearch] = useState(false);

  const [addState, addAction] = useActionState(
    addExerciseLog,
    initialActionState,
  );
  const [updateState, updateAction] = useActionState(
    updateExerciseLog,
    initialActionState,
  );

  const isEditing = !!editingLogId;
  const currentEditingLog = isEditing
    ? logs.find((l) => l.id === editingLogId)
    : null;

  useEffect(() => {
    if (addState.success && addState.newLog) {
      setLogs((prev) =>
        [...prev, addState.newLog!].sort(
          (a, b) =>
            new Date(b.logDate).getTime() - new Date(a.logDate).getTime(),
        ),
      );
    }
  }, [addState]);

  useEffect(() => {
    if (updateState.success && updateState.updatedLog) {
      setLogs((prev) =>
        prev
          .map((l) =>
            l.id === updateState.updatedLog!.id ? updateState.updatedLog! : l,
          )
          .sort(
            (a, b) =>
              new Date(b.logDate).getTime() - new Date(a.logDate).getTime(),
          ),
      );
      setEditingLogId(null);
    }
  }, [updateState]);

  const handleDelete = async (logId: string) => {
    setDeletingId(logId);
    const result = await deleteExerciseLog(logId);
    if (result?.success) {
      setLogs((prev) => prev.filter((log) => log.id !== result.deletedId));
      toast.success("Log deleted.");
    } else {
      toast.error(result?.error || "Failed to delete log.");
    }
    setDeletingId(null);
  };

  const handleEdit = (log: ClientExerciseLog) => {
    setEditingLogId(log.id);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
  };

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2 || blockSearch) {
      setSearchResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      const { exercises } = await searchExercisesAction(searchQuery);
      setSearchResults(exercises);
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, blockSearch]);

  return {
    logs,
    editingLogId,
    deletingId,
    formRef,
    addState,
    addAction,
    updateState,
    updateAction,
    isEditing,
    currentEditingLog,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    setBlockSearch,
    handleDelete,
    handleEdit,
    handleCancelEdit,
  };
};
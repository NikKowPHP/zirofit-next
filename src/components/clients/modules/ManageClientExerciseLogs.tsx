
"use client";

import { useExerciseLogManager } from "@/hooks/useExerciseLogManager";
import { type ClientExerciseLog, type Exercise } from "@/app/clients/actions";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, EmptyState } from "@/components/ui";
import { PencilIcon, TrashIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState, useMemo, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { toast } from "sonner";
import ExerciseProgressChart from "./ExerciseProgressChart";
import { useTranslations, useLocale } from "next-intl";

interface ManageClientExerciseLogsProps {
  clientId: string;
  initialExerciseLogs: ClientExerciseLog[];
}

interface Set {
  reps: string;
  weight: string;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  const t = useTranslations("Clients");

  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? isEditing
          ? t("exLogs_updating")
          : t("exLogs_adding")
        : isEditing
        ? t("exLogs_updateButton")
        : t("exLogs_addButton")}
    </Button>
  );
}


export default function ManageClientExerciseLogs({
  clientId,
  initialExerciseLogs,
}: ManageClientExerciseLogsProps) {
  const t = useTranslations("Clients");
  const locale = useLocale();
  const {
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
  } = useExerciseLogManager({ initialExerciseLogs, clientId });

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [sets, setSets] = useState<Set[]>([{ reps: "", weight: "" }]);

  const resetForm = () => {
    formRef.current?.reset();
    setSets([{ reps: "", weight: "" }]);
    setSelectedExercise(null);
    setSearchQuery("");
    setSearchResults([]);
    handleCancelEdit();
  };
  
  useEffect(() => {
    if (isEditing && currentEditingLog) {
      const exercise = currentEditingLog.exercise;
      setSelectedExercise(exercise);
      setSearchQuery(exercise.name);
      // `sets` in DB can be an object from JSONB. Ensure it's an array.
      const logSets = Array.isArray(currentEditingLog.sets) ? currentEditingLog.sets : [];
      setSets(
        (logSets as { reps: number; weight: number | null }[]).map(s => ({
          reps: String(s.reps ?? ''),
          weight: String(s.weight ?? ''),
        })),
      );
      setBlockSearch(true);
    }
  }, [isEditing, currentEditingLog]);

  useEffect(() => {
    if (addState.success) {
      toast.success(addState.message || "Log added!");
      resetForm();
    } else if (addState.error) {
      toast.error(addState.error);
    }
  }, [addState]);

  useEffect(() => {
    if (updateState.success) {
      toast.success(updateState.message || "Log updated!");
      resetForm();
    } else if (updateState.error) {
      toast.error(updateState.error);
    }
  }, [updateState]);

  const groupedLogs = useMemo(() => {
    return logs.reduce(
      (acc, log) => {
        const key = log.exercise.name;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(log);
        return acc;
      },
      {} as Record<string, ClientExerciseLog[]>,
    );
  }, [logs]);

  const handleSetChange = (index: number, field: keyof Set, value: string) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const addSet = () => {
    setSets([...sets, { reps: "", weight: "" }]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };
  
  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setSearchQuery(exercise.name);
    setSearchResults([]);
    setBlockSearch(true);
  };

  const isBodyweight = (isEditing ? currentEditingLog?.exercise.equipment : selectedExercise?.equipment) === 'Bodyweight';

  return (
    <>
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        setIsOpen={(isOpen) => !isOpen && setItemToDelete(null)}
        onConfirm={async () => {
          if (itemToDelete) {
            await handleDelete(itemToDelete);
            setItemToDelete(null);
          }
        }}
        isPending={!!deletingId}
        title={t("exLogs_deleteTitle")}
        description={t("exLogs_deleteDesc")}
      />

      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {t("exLogs_manage")}
        </h2>

        {/* Add/Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? t("exLogs_addEditTitle_edit") : t("exLogs_addEditTitle_add")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={isEditing ? updateAction : addAction} className="space-y-4" key={editingLogId || 'add'}>
              <input type="hidden" name="clientId" value={clientId} />
              {isEditing ? (
                 <input type="hidden" name="logId" value={editingLogId ?? ""} />
              ) : (
                <input type="hidden" name="exerciseId" value={selectedExercise?.id || ""} />
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input type="date" name="logDate" required defaultValue={isEditing && currentEditingLog ? new Date(currentEditingLog.logDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} />
                
                <div className="relative">
                  <Input type="text" placeholder={t("exLogs_searchPlaceholder")} value={searchQuery} onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedExercise(null);
                      setBlockSearch(false);
                    }}
                    disabled={isEditing} />
                  {isSearching && <p className="text-sm text-gray-500">{t("exLogs_searching")}</p>}
                  {searchResults.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white dark:bg-neutral-800 border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                      {searchResults.map(ex => (
                        <li key={ex.id} onClick={() => handleSelectExercise(ex)} className="px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">{ex.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">{t("exLogs_sets")}</h4>
                <input type="hidden" name="sets" value={JSON.stringify(sets.map(s => {
                  const setData: { reps: number; weight?: number } = { reps: Number(s.reps) || 0 };
                  if (!isBodyweight) {
                    setData.weight = Number(s.weight) || 0;
                  }
                  return setData;
                }))} />
                <div className="space-y-2">
                {sets.map((set, index) => (
                  <div key={index} className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-grow min-w-[200px]">
                      <span className="font-mono text-sm">{index + 1}.</span>
                      <Input type="number" placeholder={t("exLogs_reps")} value={set.reps} onChange={(e) => handleSetChange(index, 'reps', e.target.value)} required className="min-w-0" />
                      {!isBodyweight && <Input type="number" placeholder={t("exLogs_weight")} value={set.weight} onChange={(e) => handleSetChange(index, 'weight', e.target.value)} className="min-w-0" />}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isBodyweight && (
                        <Button type="button" variant="secondary" size="sm" onClick={() => handleSetChange(index, 'weight', '0')}>
                          0 kg
                        </Button>
                      )}
                      <Button type="button" variant="danger" size="sm" onClick={() => removeSet(index)} disabled={sets.length === 1}>
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={addSet} className="mt-2">
                  <PlusIcon className="h-4 w-4 mr-2" /> {t("exLogs_addSet")}
                </Button>
              </div>

              <div className="flex gap-2">
                <SubmitButton isEditing={isEditing} />
                <Button type="button" variant="secondary" onClick={resetForm}>{t("measurements_cancelButton")}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Log History */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
            {t("exLogs_history")}
          </h3>
          {Object.keys(groupedLogs).length === 0 ? (
            <EmptyState title={t("exLogs_noLogs")} description={t("exLogs_noLogsDesc")}/>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLogs).map(([exerciseName, logs]) => (
                <Card key={exerciseName}>
                   <CardHeader>
                     <CardTitle>{exerciseName}</CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                          {logs.map(log => (
                            <div key={log.id} className="p-3 bg-neutral-100 dark:bg-neutral-800/50 rounded-md">
                              <div className="flex justify-between items-center mb-2">
                                <p className="font-semibold">{new Date(log.logDate).toLocaleDateString(locale)}</p>
                                <div className="flex gap-2">
                                  <Button variant="secondary" size="sm" onClick={() => handleEdit(log)}><PencilIcon className="h-4 w-4"/></Button>
                                  <Button variant="danger" size="sm" onClick={() => setItemToDelete(log.id)}><TrashIcon className="h-4 w-4" /></Button>
                                </div>
                              </div>
                              <ul className="text-sm space-y-1">
                                {(log.sets as unknown as {reps: number, weight?: number}[]).map((set, i) => (
                                  <li key={i}>{i+1}. {set.reps} reps {set.weight != null ? `@ ${set.weight} kg` : ''}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <div className="h-80">
                           <ExerciseProgressChart logs={logs} />
                        </div>
                      </div>
                   </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
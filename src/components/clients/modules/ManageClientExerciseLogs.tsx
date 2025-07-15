"use client";

import { useExerciseLogManager } from "@/hooks/useExerciseLogManager";
import { type ClientExerciseLog } from "@/app/clients/actions";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, EmptyState, ListSkeleton } from "@/components/ui";
import { PencilIcon, TrashIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState, useMemo } from "react";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { toast } from "sonner";
import ExerciseProgressChart from "./ExerciseProgressChart";

interface ManageClientExerciseLogsProps {
  clientId: string;
  initialExerciseLogs: ClientExerciseLog[];
}

interface Set {
  reps: string;
  weight: string;
}

export default function ManageClientExerciseLogs({
  clientId,
  initialExerciseLogs,
}: ManageClientExerciseLogsProps) {
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
    handleDelete,
    handleEdit,
    handleCancelEdit,
  } = useExerciseLogManager({ initialExerciseLogs, clientId });

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string } | null>(null);
  const [sets, setSets] = useState<Set[]>([{ reps: "", weight: "" }]);

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
  
  const handleSelectExercise = (exercise: { id: string; name: string }) => {
    setSelectedExercise(exercise);
    setSearchQuery(exercise.name);
    setSearchResults([]);
  };

  const resetForm = () => {
    formRef.current?.reset();
    setSets([{ reps: "", weight: "" }]);
    setSelectedExercise(null);
    setSearchQuery("");
    handleCancelEdit();
  };
  
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
        title="Delete Exercise Log"
        description="Are you sure you want to delete this exercise log? This action cannot be undone."
      />

      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Manage Exercise Performance
        </h2>

        {/* Add/Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? `Editing Log` : "Add New Exercise Log"}</CardTitle>
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
                  <Input type="text" placeholder="Search for an exercise..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} disabled={isEditing} />
                  {isSearching && <p className="text-sm text-gray-500">Searching...</p>}
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
                <h4 className="font-medium mb-2">Sets</h4>
                <input type="hidden" name="sets" value={JSON.stringify(sets.map(s => ({ reps: Number(s.reps), weight: Number(s.weight) })))} />
                <div className="space-y-2">
                {sets.map((set, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="font-mono text-sm">{index + 1}.</span>
                    <Input type="number" placeholder="Reps" value={set.reps} onChange={(e) => handleSetChange(index, 'reps', e.target.value)} required />
                    <Input type="number" placeholder="Weight (kg)" value={set.weight} onChange={(e) => handleSetChange(index, 'weight', e.target.value)} required />
                    <Button type="button" variant="danger" size="sm" onClick={() => removeSet(index)} disabled={sets.length === 1}>
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={addSet} className="mt-2">
                  <PlusIcon className="h-4 w-4 mr-2" /> Add Set
                </Button>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{isEditing ? "Update Log" : "Add Log"}</Button>
                <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Log History */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
            Exercise History
          </h3>
          {Object.keys(groupedLogs).length === 0 ? (
            <EmptyState title="No Exercise Logs" description="Add a log above to get started."/>
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
                                <p className="font-semibold">{new Date(log.logDate).toLocaleDateString()}</p>
                                <div className="flex gap-2">
                                  <Button variant="secondary" size="sm" onClick={() => handleEdit(log)}><PencilIcon className="h-4 w-4"/></Button>
                                  <Button variant="danger" size="sm" onClick={() => setItemToDelete(log.id)}><TrashIcon className="h-4 w-4" /></Button>
                                </div>
                              </div>
                              <ul className="text-sm space-y-1">
                                {(log.sets as unknown as Set[]).map((set, i) => (
                                  <li key={i}>{i+1}. {set.reps} reps @ {set.weight} kg</li>
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
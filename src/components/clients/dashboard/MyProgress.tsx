
"use client";

import ClientStatistics from "../modules/ClientStatistics";
import ExerciseProgressChart from "../modules/ExerciseProgressChart";
import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Client, ClientMeasurement } from "@/app/[locale]/clients/actions";
import type { ClientExerciseLog } from "@/app/[locale]/client-dashboard/actions";

interface MyProgressProps {
    clientData: Client & {
        measurements: ClientMeasurement[],
        exerciseLogs: ClientExerciseLog[]
    }
}

export default function MyProgress({ clientData }: MyProgressProps) {
    const groupedLogs = useMemo(() => {
        return clientData.exerciseLogs.reduce<Record<string, ClientExerciseLog[]>>(
          (acc, log) => {
            const key = log.exercise.name;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(log);
            return acc;
          },
          {},
        );
      }, [clientData.exerciseLogs]);

    return (
        <div className="space-y-8">
            <ClientStatistics measurements={clientData.measurements} />

            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Exercise Progress</h2>
                {Object.entries(groupedLogs).map(([exerciseName, logs]) => (
                    <Card key={exerciseName}>
                        <CardHeader>
                            <CardTitle>{exerciseName}</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ExerciseProgressChart logs={logs} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

"use client";

import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { useTheme } from "@/context/ThemeContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMemo } from "react";
import { ClientExerciseLog } from "@/app/[locale]/clients/actions";
import { useTranslations } from "next-intl";

interface ExerciseProgressChartProps {
  logs: ClientExerciseLog[];
}

export default function ExerciseProgressChart({
  logs,
}: ExerciseProgressChartProps) {
  const t = useTranslations("Clients");
  const { theme } = useTheme();
  const isBodyweight = logs[0]?.exercise.equipment === "Bodyweight";

  const chartData = useMemo(() => {
    const dataPoints = logs
      .map((log) => {
        const setsArray = Array.isArray(log.sets) ? log.sets : [];
        const yValue = isBodyweight
          ? (setsArray as { reps: any }[]).reduce(
              (sum, set) => sum + (Number(set.reps) || 0),
              0,
            ) // Total Reps
          : (setsArray as { reps: any; weight: any }[]).reduce(
              (sum, set) =>
                sum + (Number(set.reps) || 0) * (Number(set.weight) || 0),
              0,
            ); // Total Volume

        return {
          x: new Date(log.logDate),
          y: yValue,
        };
      })
      .sort((a, b) => a.x.getTime() - b.x.getTime());

    const datasetLabel = isBodyweight
      ? t("exLogs_totalReps")
      : t("exLogs_totalVolume");

    return {
      datasets: [
        {
          label: datasetLabel,
          data: dataPoints,
          borderColor:
            theme === "dark" ? "rgb(99, 102, 241)" : "rgb(79, 70, 229)",
          backgroundColor:
            theme === "dark"
              ? "rgba(99, 102, 241, 0.2)"
              : "rgba(79, 70, 229, 0.2)",
          tension: 0.1,
          fill: true,
        },
      ],
    };
  }, [logs, theme, isBodyweight, t]);

  if (logs.length < 2) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          title={t("exLogs_notEnoughData_title")}
          description={t("exLogs_notEnoughData_desc")}
        />
      </div>
    );
  }

  const textColor =
    theme === "dark" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)";
  const gridColor =
    theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: isBodyweight ? t("exLogs_yAxisTotalReps") : t("exLogs_yAxisTotalVolume"),
          color: textColor,
        },
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      x: {
        type: "time" as const,
        time: { unit: "day" as const },
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
    },
  };

  return <Line options={chartOptions} data={chartData} />;
}
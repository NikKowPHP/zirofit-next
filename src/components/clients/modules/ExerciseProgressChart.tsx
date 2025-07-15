
"use client";

import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { useTheme } from "@/context/ThemeContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMemo } from "react";
import { ClientExerciseLog } from "@/app/clients/actions";

interface ExerciseProgressChartProps {
  logs: ClientExerciseLog[];
}

export default function ExerciseProgressChart({
  logs,
}: ExerciseProgressChartProps) {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    const dataPoints = logs
      .map((log) => {
        const setsArray = Array.isArray(log.sets) ? log.sets : [];
        const totalVolume = (
          setsArray as { reps: any; weight: any }[]
        ).reduce(
          (sum, set) =>
            sum + (Number(set.reps) || 0) * (Number(set.weight) || 0),
          0,
        );
        return {
          x: new Date(log.logDate),
          y: totalVolume,
        };
      })
      .sort((a, b) => a.x.getTime() - b.x.getTime());

    return {
      datasets: [
        {
          label: "Total Volume (reps * weight)",
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
  }, [logs, theme]);

  if (logs.length < 2) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          title="Not Enough Data"
          description="Log this exercise at least twice to see a progress chart."
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
          text: "Total Volume",
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
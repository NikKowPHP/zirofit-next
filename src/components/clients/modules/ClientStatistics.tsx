
"use client";

import type { ClientMeasurement } from "@/app/clients/actions/measurement-actions";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import {
  getWeightProgress,
  getBodyFatProgress,
} from "@/lib/services/ClientStatisticsService";
import { useTheme } from "@/context/ThemeContext";
import { EmptyState } from "@/components/ui/EmptyState";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
);

interface ClientStatisticsProps {
  measurements: ClientMeasurement[];
}

export default function ClientStatistics({
  measurements,
}: ClientStatisticsProps) {
  const { theme } = useTheme();

  const textColor =
    theme === "dark" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)";
  const gridColor =
    theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";

  const chartOptions = (yAxisLabel: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: textColor },
      },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: yAxisLabel, color: textColor },
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
  });

  const weightMeasurements = measurements.filter((m) => m.weightKg != null);
  const bodyFatMeasurements = measurements.filter(
    (m) => m.bodyFatPercentage != null,
  );

  const weightData = {
    datasets: [
      {
        label: "Weight (kg)",
        data: getWeightProgress(weightMeasurements),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.5)",
      },
    ],
  };

  const bodyFatData = {
    datasets: [
      {
        label: "Body Fat (%)",
        data: getBodyFatProgress(bodyFatMeasurements),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Client Statistics
      </h2>
      <div className="h-80">
        <h3 className="font-semibold mb-2 dark:text-gray-200">
          Weight Progress
        </h3>
        {weightMeasurements.length > 1 ? (
          <Line options={chartOptions("Weight (kg)")} data={weightData} />
        ) : (
          <EmptyState
            title="No Weight Data"
            description="Log your client's weight at least twice to see their progress here."
          />
        )}
      </div>
      <div className="h-80">
        <h3 className="font-semibold mb-2 dark:text-gray-200">
          Body Fat Progress
        </h3>
        {bodyFatMeasurements.length > 1 ? (
          <Line options={chartOptions("Body Fat %")} data={bodyFatData} />
        ) : (
          <EmptyState
            title="No Body Fat Data"
            description="Log your client's body fat percentage at least twice to see their progress here."
          />
        )}
      </div>
    </div>
  );
}
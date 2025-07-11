"use client";

import { useTheme } from "@/context/ThemeContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface MonthlyActivityChartProps {
  data: {
    x: string; // Week label (e.g., "Week 1")
    y: number; // Activity count
  }[];
  title?: string;
}

export default function MonthlyActivityChart({
  data,
  title,
}: MonthlyActivityChartProps) {
  const { theme } = useTheme();

  const textColor =
    theme === "dark" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)";
  const gridColor =
    theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: !!title,
        text: title,
        color: textColor,
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Activities",
          color: textColor,
        },
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
      x: {
        ticks: {
          color: textColor,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const chartData = {
    labels: data.map((d) => d.x),
    datasets: [
      {
        label: "Activities",
        data: data.map((d) => d.y),
        backgroundColor:
          theme === "dark"
            ? "rgba(59, 130, 246, 0.7)"
            : "rgba(59, 130, 246, 0.5)",
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col h-full">
      {title && (
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      <div className="relative flex-grow h-64">
        <Bar options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}

"use client";

import { useTheme } from "@/context/ThemeContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
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
import 'chartjs-adapter-date-fns';
import { Line } from "react-chartjs-2";

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

interface ClientProgressChartProps {
  data: {
    x: string; // date string
    y: number;
  }[];
  title?: string;
}

export default function ClientProgressChart({
  data,
  title,
}: ClientProgressChartProps) {
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
        position: "top" as const,
        labels: {
          color: textColor,
        },
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
        beginAtZero: false,
        title: {
          display: true,
          text: "Weight (kg)",
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
        type: 'time' as const,
        time: {
          unit: 'day' as const
        },
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
    },
  };

  const chartData = {
    labels: data.map((d) => d.x),
    datasets: [
      {
        label: "Weight",
        data: data.map((d) => d.y),
        borderColor: theme === "dark" ? "rgb(99, 102, 241)" : "rgb(79, 70, 229)",
        backgroundColor:
          theme === "dark"
            ? "rgba(99, 102, 241, 0.2)"
            : "rgba(79, 70, 229, 0.2)",
        tension: 0.4,
      },
    ],
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
      </CardHeader>
      <CardContent className="relative flex-grow h-64" data-testid="chart-canvas">
        <Line options={chartOptions} data={chartData} />
      </CardContent>
    </Card>
  );
}
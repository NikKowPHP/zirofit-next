"use client";

import type { ClientMeasurement } from "@prisma/client"; // Import the data type
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
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { getWeightProgress, getBodyFatProgress, getCustomMetricProgress } from "@/lib/services/ClientStatisticsService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface ClientStatisticsProps {
  measurements: ClientMeasurement[]
}

export default function ClientStatistics({ measurements }: ClientStatisticsProps) {
  const weightData = {
    labels: measurements.map(m => m.measurementDate.toLocaleDateString()), // Corrected property name from sessionDate to measurementDate
    datasets: [
      {
        label: 'Weight (kg)',
        data: getWeightProgress(measurements),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const bodyFatData = {
    labels: measurements.map(m => m.measurementDate.toLocaleDateString()), // Corrected property name
    datasets: [
      {
        label: 'Body Fat (%)',
        data: getBodyFatProgress(measurements),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div>
      <h2>Client Statistics</h2>
      <Line data={weightData} />
      <Line data={bodyFatData} />
    </div>
  );
}
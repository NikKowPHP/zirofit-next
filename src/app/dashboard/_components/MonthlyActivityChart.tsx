'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface MonthlyActivityChartProps {
  data: {
    x: string; // Week label (e.g., "Week 1")
    y: number; // Activity count
  }[]
  title?: string
}

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Monthly Activity',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Activities',
      },
    },
  },
}

export default function MonthlyActivityChart({ data, title }: MonthlyActivityChartProps) {
  const chartData = {
    labels: data.map(d => d.x),
    datasets: [
      {
        label: 'Activities',
        data: data.map(d => d.y),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  }

  return (
    <div className="flex flex-col h-full">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <div className="relative h-64">
        <Bar options={chartOptions} data={chartData} />
      </div>
    </div>
  )
}
'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ClientProgressChartProps {
  data: {
    labels: string[]
    measurements: number[]
  }
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
      text: 'Client Progress',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Measurements',
      },
    },
  },
}

export default function ClientProgressChart({ data, title }: ClientProgressChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Progress',
        data: data.measurements,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
    ],
  }

  return (
    <div className="flex flex-col h-full">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <div className="relative h-64">
        <Line options={chartOptions} data={chartData} />
      </div>
    </div>
  )
}
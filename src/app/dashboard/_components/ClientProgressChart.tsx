'use client'

import { useTheme } from '@/context/ThemeContext'
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
    date: Date;
    value: number;
  }[];
  title?: string
}

interface ChartDataProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

export default function ClientProgressChart({ data, title }: ClientProgressChartProps) {
  const { theme } = useTheme()
  console.log('theme', theme)

  const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
        }
      },
      title: {
        display: !!title,
        text: title,
        color: textColor,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Progress Value',
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
          color: gridColor,
        },
      }
    },
  }

  const chartData: ChartDataProps = {
    labels: data.map(d => d.date.toLocaleDateString()),
    datasets: [
      {
        label: 'Progress',
        data: data.map(d => d.value),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="flex flex-col h-full">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <div className="relative h-64" data-testid="chart-canvas">
        <Line options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}

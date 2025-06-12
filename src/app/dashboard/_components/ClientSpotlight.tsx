"use client";

import { useEffect, useRef } from 'react';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip);

interface Measurement {
  date: Date;
  value: number;
  type: string;
}

interface ClientSpotlightProps {
  clientName?: string;
  measurements?: Measurement[];
}

export default function ClientSpotlight({ clientName, measurements }: ClientSpotlightProps) {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!clientName || !measurements || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart instance
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: measurements.map(m => m.date.toLocaleDateString()),
        datasets: [{
          label: 'Measurements',
          data: measurements.map(m => m.value),
          backgroundColor: '#3b82f6', // Brand blue
          borderColor: '#1d4ed8', // Darker blue
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 16/9,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Value'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [measurements, clientName]);

  if (!clientName || !measurements) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <p className="text-gray-500">Log new measurements to see client progress here!</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-semibold mb-2">{clientName}'s Progress</h3>
      <div className="h-48">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
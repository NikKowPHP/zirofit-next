'use client'

interface ClientProgressChartProps {
  data: {
    labels: string[]
    measurements: number[]
  }
  title?: string
}

export default function ClientProgressChart({ data, title }: ClientProgressChartProps) {
  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <canvas data-testid="chart-canvas"></canvas>
    </div>
  )
}
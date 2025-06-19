import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ClientProgressChart from './ClientProgressChart'

describe('ClientProgressChart', () => {
  const testData = [
    { x: '2025-01-01', y: 65 },
    { x: '2025-01-08', y: 63 },
    { x: '2025-01-15', y: 64 }
  ]

  it('renders a canvas element for the chart', () => {
    render(<ClientProgressChart data={testData} />)
    expect(screen.getByTestId('chart-canvas')).toBeInTheDocument()
  })

  it('displays the chart title when provided', () => {
    render(<ClientProgressChart data={testData} title="Client Progress" />)
    expect(screen.getByText('Client Progress')).toBeInTheDocument()
  })

  it('does not display title when not provided', () => {
    render(<ClientProgressChart data={testData} />)
    expect(screen.queryByText('Client Progress')).not.toBeInTheDocument()
  })
})
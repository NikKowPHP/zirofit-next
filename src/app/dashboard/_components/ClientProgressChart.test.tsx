import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ClientProgressChart from './ClientProgressChart'

describe('ClientProgressChart', () => {
  const testData = {
    labels: ['Week 1', 'Week 2', 'Week 3'],
    measurements: [65, 63, 64]
  }

  it('renders a canvas element for the chart', () => {
    render(<ClientProgressChart data={testData} />)
    expect(screen.getByTestId('chart-canvas')).toBeInTheDocument()
  })

  it('displays the chart title', () => {
    render(<ClientProgressChart data={testData} title="Client Progress" />)
    expect(screen.getByText('Client Progress')).toBeInTheDocument()
  })
})
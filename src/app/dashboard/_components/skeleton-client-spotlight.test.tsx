import { render, screen } from '@testing-library/react'
import SkeletonClientSpotlight from './skeleton-client-spotlight'

describe('SkeletonClientSpotlight', () => {
  it('should have a test ID on the root element', () => {
    render(<SkeletonClientSpotlight />)
    expect(screen.getByTestId('skeleton-client-spotlight')).toBeInTheDocument()
  })
})
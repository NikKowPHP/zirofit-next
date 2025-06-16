import { render, screen } from '@testing-library/react'
import SkeletonActivityFeed from './skeleton-activity-feed'

describe('SkeletonActivityFeed', () => {
  it('should have a test ID on the root element', () => {
    render(<SkeletonActivityFeed />)
    expect(screen.getByTestId('skeleton-activity-feed')).toBeInTheDocument()
  })
})
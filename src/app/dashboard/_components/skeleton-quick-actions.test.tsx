import { render, screen } from '@testing-library/react'
import SkeletonQuickActions from './skeleton-quick-actions'

describe('SkeletonQuickActions', () => {
  it('should have a test ID on the root element', () => {
    render(<SkeletonQuickActions />)
    expect(screen.getByTestId('skeleton-quick-actions')).toBeInTheDocument()
  })
})
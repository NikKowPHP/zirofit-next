import { render, screen } from '@testing-library/react'
import SkeletonProfileChecklist from './skeleton-profile-checklist'

describe('SkeletonProfileChecklist', () => {
  it('should have a test ID on the root element', () => {
    render(<SkeletonProfileChecklist />)
    expect(screen.getByTestId('skeleton-profile-checklist')).toBeInTheDocument()
  })
})
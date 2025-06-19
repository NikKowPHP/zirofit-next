import { render, screen } from '@testing-library/react'
import SkeletonProfileChecklist from './skeleton-profile-checklist'

describe('SkeletonProfileChecklist', () => {
  beforeEach(() => {
    render(<SkeletonProfileChecklist />)
  })

  it('should have a test ID on the root element', () => {
    expect(screen.getByTestId('skeleton-profile-checklist')).toBeInTheDocument()
  })

  
})
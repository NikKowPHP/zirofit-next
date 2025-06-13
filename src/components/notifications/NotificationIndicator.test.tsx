import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationIndicator from './NotificationIndicator'
import { vi } from 'vitest'

// Mock WebSocket
class WebSocket {
  constructor() {
    this.onopen = vi.fn()
    this.onmessage = vi.fn()
    this.onerror = vi.fn()
    this.close = vi.fn()
  }
  onopen() {}
  onmessage() {}
  onerror() {}
  close() {}
}

global.WebSocket = WebSocket

// Mock API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([
      { id: '1', message: 'Test notification', readStatus: false }
    ]),
    ok: true
  })
)

describe('NotificationIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays unread count', async () => {
    render(<NotificationIndicator />)
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  it('toggles dropdown when clicked', async () => {
    render(<NotificationIndicator />)
    
    const button = screen.getByRole('button')
    await userEvent.click(button)
    
    expect(screen.getByText('Test notification')).toBeInTheDocument()
    
    await userEvent.click(button)
    expect(screen.queryByText('Test notification')).not.toBeInTheDocument()
  })

  it('updates when receiving new notifications', async () => {
    render(<NotificationIndicator />)
    
    act(() => {
      const newNotification = {
        type: 'notification',
        data: { id: '2', message: 'New notification', readStatus: false }
      }
      WebSocket.prototype.onmessage({
        data: JSON.stringify(newNotification)
      })
    })
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })
})
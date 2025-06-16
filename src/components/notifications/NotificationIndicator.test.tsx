import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationIndicator from './NotificationIndicator'

// Mock WebSocket
class WebSocket {
  constructor() {
    this.onopen = jest.fn()
    this.onmessage = jest.fn((event?: MessageEvent) => {})
    this.onerror = jest.fn()
    this.close = jest.fn()
    Object.assign(WebSocket, {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    })
  }
  onopen() {}
  onmessage(event?: MessageEvent) {}
  onerror() {}
  close() {}
}

global.WebSocket = WebSocket as any
;(global.WebSocket as any).CONNECTING = 0
;(global.WebSocket as any).OPEN = 1
;(global.WebSocket as any).CLOSING = 2
;(global.WebSocket as any).CLOSED = 3

// Mock API calls
const mockFetchResponse = {
  ok: true,
  json: () => Promise.resolve([
    { id: '1', message: 'Test notification', readStatus: false }
  ]),
  headers: new Headers(),
  redirected: false,
  status: 200,
  statusText: 'OK',
  type: 'basic',
  url: '',
  clone: jest.fn(),
  text: jest.fn(),
  blob: jest.fn(),
  formData: jest.fn(),
  arrayBuffer: jest.fn(),
  bodyUsed: false,
  body: null
} as unknown as Response;

global.fetch = jest.fn(() => Promise.resolve(mockFetchResponse))

describe('NotificationIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
      const mockEvent = {
        data: JSON.stringify(newNotification),
        lastEventId: '',
        origin: '',
        ports: [],
        source: null,
        bubbles: false,
        cancelBubble: false,
        cancelable: false,
        composed: false,
        currentTarget: null,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: true,
        returnValue: true,
        srcElement: null,
        target: null,
        timeStamp: 0,
        type: 'message',
        composedPath: () => [],
        initEvent: () => {},
        preventDefault: () => {},
        stopImmediatePropagation: () => {},
        stopPropagation: () => {},
        NONE: 0,
        CAPTURING_PHASE: 1,
        AT_TARGET: 2,
        BUBBLING_PHASE: 3
      } as unknown as MessageEvent;
      
      WebSocket.prototype.onmessage?.(mockEvent)
    })
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })
})
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotificationIndicator from "./NotificationIndicator";

// Mock WebSocket
class WebSocket {
  constructor() {
    this.onopen = jest.fn();
    this.onmessage = jest.fn((event?: MessageEvent) => {});
    this.onerror = jest.fn();
    this.close = jest.fn();
    Object.assign(WebSocket, {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
    });
  }
  onopen() {}
  onmessage(event?: MessageEvent) {}
  onerror() {}
  close() {}
}

global.WebSocket = WebSocket as any;
(global.WebSocket as any).CONNECTING = 0;
(global.WebSocket as any).OPEN = 1;
(global.WebSocket as any).CLOSING = 2;
(global.WebSocket as any).CLOSED = 3;

// Mock API calls
const mockFetchResponse = {
  ok: true,
  json: () =>
    Promise.resolve([
      {
        id: "1",
        message: "Test notification",
        readStatus: false,
        createdAt: new Date().toISOString(),
      },
    ]),
  headers: new Headers(),
  redirected: false,
  status: 200,
  statusText: "OK",
  type: "basic",
  url: "",
  clone: jest.fn(),
  text: jest.fn(),
  blob: jest.fn(),
  formData: jest.fn(),
  arrayBuffer: jest.fn(),
  bodyUsed: false,
  body: null,
} as unknown as Response;

global.fetch = jest.fn(() => Promise.resolve(mockFetchResponse));

// Mock the WebSocket
const mockWebSocket = {
  onopen: jest.fn(),
  onmessage: jest.fn(),
  onerror: jest.fn(),
  close: jest.fn(),
  send: jest.fn(),
  readyState: 1, // OPEN
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

global.WebSocket = jest.fn(() => mockWebSocket) as any;

describe("NotificationIndicator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "test-user-id" } },
        }),
      },
    };
    jest.mock("@/lib/supabase/client", () => ({
      createClient: () => mockSupabase,
    }));
  });

  it("displays unread count", async () => {
    render(<NotificationIndicator />);

    // Trigger the fetchNotifications call
    const button = screen.getByRole("button");
    await userEvent.click(button);

    await waitFor(
      () => {
        expect(screen.getByTestId("notification-count")).toHaveTextContent("1");
      },
      { timeout: 3000 },
    );
  });

  it("toggles dropdown when clicked", async () => {
    render(<NotificationIndicator />);

    const button = screen.getByRole("button", { name: /Toggle notifications/ });
    await userEvent.click(button);

    expect(await screen.findByText("Test notification")).toBeInTheDocument();

    await userEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText("Test notification")).not.toBeInTheDocument();
    });
  });
});
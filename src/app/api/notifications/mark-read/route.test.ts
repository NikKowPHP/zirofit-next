import { POST } from "./route";
import { getCurrentUser } from "@/lib/session";
import { prismaMock } from "../../@tests/singleton";
import { NextResponse } from "next/server";

jest.mock("@/lib/session");
const mockGetCurrentUser = getCurrentUser as jest.Mock;

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      json: () => Promise.resolve(body),
      status: init?.status || 200,
      ok: (init?.status || 200) < 400,
      headers: new Headers(),
    })),
  },
}));

describe("Notifications Mark Read API POST", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should mark a notification as read for an authenticated user", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-123" });
    const notificationId = "notif-abc";
    const request = new Request("http://localhost/api/notifications/mark-read", {
      method: "POST",
      body: JSON.stringify({ notificationId }),
    });

    await POST(request);

    expect(prismaMock.notification.update).toHaveBeenCalledWith({
      where: {
        id: notificationId,
        userId: "user-123", // Ensures user can only update their own notifications
      },
      data: {
        readStatus: true,
      },
    });
  });

  it("should return 401 if user is not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const request = new Request("http://localhost/api/notifications/mark-read", {
      method: "POST",
      body: JSON.stringify({ notificationId: "notif-abc" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
    expect(prismaMock.notification.update).not.toHaveBeenCalled();
  });

  it("should return 400 if notificationId is not provided", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-123" });
    const request = new Request("http://localhost/api/notifications/mark-read", {
      method: "POST",
      body: JSON.stringify({}), // Missing notificationId
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Notification ID is required" });
    expect(prismaMock.notification.update).not.toHaveBeenCalled();
  });
});
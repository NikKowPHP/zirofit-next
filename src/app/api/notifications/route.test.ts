import { GET } from "./route";
import { getCurrentUser } from "@/lib/session";
import { prismaMock } from "../../../../tests/singleton";
import { NextResponse } from "next/server";

jest.mock("@/lib/session");

const mockGetCurrentUser = getCurrentUser as jest.Mock;

describe("Notifications API GET", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return notifications for an authenticated user", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-123" });
    const mockNotifications = [
      {
        id: "1",
        message: "Test",
        userId: "user-123",
        type: "test-type",
        readStatus: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    prismaMock.notification.findMany.mockResolvedValue(mockNotifications);

    const response = await GET();
    const body = await response.json();

    expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
      where: { userId: "user-123" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    expect(response.status).toBe(200);
    // Compare after JSON serialization to handle Date objects
    expect(body).toEqual(JSON.parse(JSON.stringify(mockNotifications)));
  });

  it("should return a 401 Unauthorized error if user is not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("should return a 500 Internal Server Error if prisma fails", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-123" });
    prismaMock.notification.findMany.mockRejectedValue(
      new Error("Database error"),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Internal server error" });
  });
});
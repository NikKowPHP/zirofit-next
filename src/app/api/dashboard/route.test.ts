import { GET } from "./route";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/services/dashboardService";
import { NextResponse } from "next/server";

jest.mock("@/lib/supabase/server");
jest.mock("@/lib/services/dashboardService");

const mockCreateSupabaseClient = createClient as jest.Mock;
const mockGetDashboardData = getDashboardData as jest.Mock;

describe("Dashboard API GET", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return dashboard data for an authenticated user", async () => {
    mockCreateSupabaseClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user-123" } },
          error: null,
        }),
      },
    });
    mockGetDashboardData.mockResolvedValue({ activeClients: 5 });

    const response = await GET();
    const body = await response.json();

    expect(getDashboardData).toHaveBeenCalledWith("user-123");
    expect(response.status).toBe(200);
    expect(body).toEqual({ activeClients: 5 });
  });

  it("should return a 401 Unauthorized error if user is not authenticated", async () => {
    mockCreateSupabaseClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    });

    const response = await GET();
    const body = await response.json();

    expect(getDashboardData).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("should return a 500 Internal Server Error if getDashboardData fails", async () => {
    mockCreateSupabaseClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user-123" } },
          error: null,
        }),
      },
    });
    mockGetDashboardData.mockRejectedValue(new Error("Database error"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Internal server error" });
  });
});
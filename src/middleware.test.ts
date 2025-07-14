import { middleware } from "./middleware";
import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

jest.mock("@supabase/ssr");

describe("Middleware", () => {
  const mockCreateServerClient = createServerClient as jest.Mock;

  it("should redirect unauthenticated user from protected route to login", async () => {
    // Mock Supabase to return no user
    mockCreateServerClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const req = new NextRequest(new URL("/dashboard", "http://localhost"));
    const res = await middleware(req);

    expect(res.status).toBe(307); // Redirect status
    expect(res.headers.get("Location")).toContain("/auth/login");
  });

  it("should redirect authenticated user from auth route to dashboard", async () => {
    // Mock Supabase to return a user
    mockCreateServerClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: "123" } } }),
      },
    });

    const req = new NextRequest(new URL("/auth/login", "http://localhost"));
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("Location")).toContain("/dashboard");
  });

  it("should allow authenticated user to access protected route", async () => {
    // Mock Supabase to return a user
    mockCreateServerClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: "123" } } }),
      },
    });

    const req = new NextRequest(new URL("/dashboard", "http://localhost"));
    const res = await middleware(req);

    // Expecting the middleware to pass through, not redirect
    expect(res.status).toBe(200);
    // Location header should not be set
    expect(res.headers.get("Location")).toBeNull();
  });

  it("should allow unauthenticated user to access public route", async () => {
    // Mock Supabase to return no user
    mockCreateServerClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const req = new NextRequest(new URL("/", "http://localhost"));
    const res = await middleware(req);

    // Expecting the middleware to pass through, not redirect
    expect(res.status).toBe(200);
    expect(res.headers.get("Location")).toBeNull();
  });
});
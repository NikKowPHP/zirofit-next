import { middleware } from "./middleware";
import { NextRequest, NextResponse } from "next/server";
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

    const req = new NextRequest(new URL("/dashboard", "http://localhost"), {
      headers: new Headers(),
    });
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

    const req = new NextRequest(new URL("/auth/login", "http://localhost"), {
      headers: new Headers(),
    });
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

    const req = new NextRequest(new URL("/dashboard", "http://localhost"), {
      headers: new Headers(),
    });
    // The middleware modifies the response, so we need to inspect it.
    // The original `middleware` returns `response`, which is a `NextResponse.next()`.
    // In Jest, this won't have a body or a status code unless we are redirecting.
    // The key is that it doesn't throw and doesn't return a redirect response.
    const res = await middleware(req);

    // Expecting the middleware to pass through, not redirect.
    // A passthrough response might not have a 200 status code here,
    // the crucial part is that it is NOT a redirect.
    expect(res.status).not.toBe(307);
    expect(res.headers.get("Location")).toBeNull();
  });

  it("should allow unauthenticated user to access public route", async () => {
    // Mock Supabase to return no user
    mockCreateServerClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const req = new NextRequest(new URL("/", "http://localhost"), {
      headers: new Headers(),
    });
    const res = await middleware(req);

    // Expecting the middleware to pass through, not redirect
    expect(res.status).not.toBe(307);
    expect(res.headers.get("Location")).toBeNull();
  });
});
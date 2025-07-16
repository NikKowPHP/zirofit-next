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

    const req = new NextRequest(new URL("/en/dashboard", "http://localhost"), {
      headers: new Headers(),
    });
    const res = await middleware(req);

    expect(res.status).toBe(307); // Redirect status
    expect(res.headers.get("Location")).toContain("/en/auth/login");
  });

  it("should redirect authenticated user from auth route to dashboard", async () => {
    // Mock Supabase to return a user
    mockCreateServerClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: "123" } } }),
      },
    });

    const req = new NextRequest(new URL("/en/auth/login", "http://localhost"), {
      headers: new Headers(),
    });
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("Location")).toContain("/en/dashboard");
  });

  it("should allow authenticated user to access protected route", async () => {
    // Mock Supabase to return a user
    mockCreateServerClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: "123" } } }),
      },
    });
    const headers = new Headers();
    headers.set('x-next-intl-locale', 'en');
    const req = new NextRequest(new URL("/en/dashboard", "http://localhost"), {
      headers,
    });
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
    const headers = new Headers();
    headers.set('x-next-intl-locale', 'en');
    const req = new NextRequest(new URL("/en/", "http://localhost"), {
      headers,
    });
    const res = await middleware(req);

    // Expecting the middleware to pass through, not redirect
    expect(res.status).not.toBe(307);
    expect(res.headers.get("Location")).toBeNull();
  });
});
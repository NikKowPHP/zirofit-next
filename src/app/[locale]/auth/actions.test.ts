
import { registerUser, loginUser, logoutUser } from "./actions";
import { prismaMock } from "@tests/singleton";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

jest.mock("@/lib/supabase/server");
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
};

(createClient as jest.Mock).mockResolvedValue(mockSupabase);

describe("Auth Actions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    const formData = new FormData();
    formData.append("name", "Test User");
    formData.append("email", "test@example.com");
    formData.append("password", "password123");

    it("should register a new user successfully and redirect", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "supabase-id" } },
        error: null,
      });
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockResolvedValue([
        { id: "user-id", name: "Test User" },
        { id: "profile-id" },
      ] as any);

      await registerUser(undefined, formData);

      expect(mockSupabase.auth.signUp).toHaveBeenCalled();
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith(
        "/auth/login?message=Registration successful! Please log in.",
      );
    });

    it("should return an error if email is already registered", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "supabase-id" } },
        error: null,
      });
      prismaMock.user.findUnique.mockResolvedValue({
        id: "existing-user",
      } as any);

      const result = await registerUser(undefined, formData);

      expect(result.error).toBe("Email already registered.");
      expect(redirect).not.toHaveBeenCalled();
    });

    it("should return an error if Supabase signUp fails", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: "Supabase error" },
      });

      const result = await registerUser(undefined, formData);

      expect(result.error).toContain("Supabase error");
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it("should return an error if Prisma transaction fails", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "supabase-id" } },
        error: null,
      });
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockRejectedValue(new Error("DB error"));

      const result = await registerUser(undefined, formData);

      expect(result.error).toContain("DB error");
    });

    it("should generate a unique username if the base slug exists", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "supabase-id" } },
        error: null,
      });
      // Mock that "test-user" exists, but "test-user-1" does not.
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null) // for email check
        .mockResolvedValueOnce({ id: "another-user" } as any) // for username 'test-user'
        .mockResolvedValueOnce(null); // for username 'test-user-1'
      
      // Make the create operations return their arguments so they are not undefined in the transaction array.
      (prismaMock.user.create as jest.Mock).mockImplementation((args) => args);
      (prismaMock.profile.create as jest.Mock).mockImplementation((args) => args);

      prismaMock.$transaction.mockResolvedValue([
        { id: "user-id", name: "Test User" },
        { id: "profile-id" },
      ] as any);

      await registerUser(undefined, formData);

      expect(prismaMock.$transaction).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({ username: "test-user-1" }),
          }),
          expect.anything(),
        ]),
      );
    });
  });

  describe("loginUser", () => {
    it("should log in a user successfully and redirect", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");

      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });

      await loginUser(undefined, formData);

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });

    it("should return an error on failed login", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "wrong-password");

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: { message: "Invalid credentials" },
      } as any);

      const result = await loginUser(undefined, formData);

      expect(result.error).toBe("Invalid credentials");
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe("logoutUser", () => {
    it("should log out a user and redirect", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      await logoutUser();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith(
        "/auth/login?message=Logged out successfully.",
      );
    });
  });
});
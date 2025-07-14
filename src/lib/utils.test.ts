// src/lib/utils.test.ts
import { normalizeLocation, generateGoogleCalendarLink } from "./utils";
import type { Booking } from "@prisma/client";

describe("normalizeLocation utility", () => {
  it("should convert a basic string to lowercase", () => {
    expect(normalizeLocation("Warsaw")).toBe("warsaw");
  });

  it("should correctly handle Polish diacritics", () => {
    expect(normalizeLocation("Łódź")).toBe("lodz");
    expect(normalizeLocation("Gdańsk")).toBe("gdansk");
    expect(normalizeLocation("Żyrardów")).toBe("zyrardow");
    expect(normalizeLocation("Częstochowa")).toBe("czestochowa");
    expect(normalizeLocation("Bielsko-Biała")).toBe("bielsko-biala");
    expect(normalizeLocation("Świętokrzyskie")).toBe("swietokrzyskie");
  });

  it("should handle mixed case strings with diacritics", () => {
    expect(normalizeLocation("WROCŁAW")).toBe("wroclaw");
  });

  it("should return an empty string if input is empty", () => {
    expect(normalizeLocation("")).toBe("");
  });

  it("should not affect strings that do not need normalization", () => {
    expect(normalizeLocation("krakow")).toBe("krakow");
  });
});

describe("generateGoogleCalendarLink utility", () => {
  const mockBooking = {
    id: "booking1",
    startTime: new Date("2025-12-25T10:00:00.000Z"),
    endTime: new Date("2025-12-25T11:00:00.000Z"),
    clientName: "Test Client",
    clientEmail: "test@client.com",
    clientNotes: "Test notes about the session.",
    trainerId: "trainer1",
    status: "CONFIRMED",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Booking;

  it("should generate a valid Google Calendar link with all details", () => {
    const link = generateGoogleCalendarLink(mockBooking);
    expect(link).toContain("https://www.google.com/calendar/render?");
    const params = new URL(link).searchParams;
    expect(params.get("action")).toBe("TEMPLATE");
    expect(params.get("text")).toBe("Session with Test Client");
    expect(params.get("dates")).toBe("20251225T100000Z/20251225T110000Z");
    const details = params.get("details");
    expect(details).toContain("Client: Test Client");
    expect(details).toContain("Email: test@client.com");
    expect(details).toContain("Notes: Test notes about the session.");
  });

  it("should handle bookings with no notes", () => {
    const bookingWithNoNotes = { ...mockBooking, clientNotes: null };
    const link = generateGoogleCalendarLink(bookingWithNoNotes);
    const params = new URL(link).searchParams;
    const details = params.get("details");
    expect(details).not.toContain("Notes:");
  });
});
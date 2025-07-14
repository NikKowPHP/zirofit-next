import { createBooking } from "./booking-actions";
import * as bookingService from "@/lib/services/bookingService";
import * as notificationService from "@/lib/services/notificationService";

jest.mock("@/lib/services/bookingService");
jest.mock("@/lib/services/notificationService");

describe("Booking Actions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createBooking", () => {
    const formData = new FormData();
    formData.append("trainerId", "trainer-1");
    formData.append("startTime", new Date().toISOString());
    formData.append("endTime", new Date(Date.now() + 3600000).toISOString());
    formData.append("clientName", "Test Client");
    formData.append("clientEmail", "client@test.com");
    formData.append("clientNotes", "");

    it("should create a booking and send notifications if slot is available", async () => {
      (bookingService.getSchedule as jest.Mock).mockResolvedValue({
        availability: { mon: ["09:00-17:00"] }, // Provide some availability
        bookings: [],
      });
      (bookingService.isSlotAvailable as jest.Mock).mockReturnValue({
        available: true,
      });
      (bookingService.createNewBooking as jest.Mock).mockResolvedValue({
        id: "booking-1",
      });
      (bookingService.getTrainerForBooking as jest.Mock).mockResolvedValue({
        email: "trainer@test.com",
        name: "Test Trainer",
      });

      const result = await createBooking(undefined, formData);

      expect(bookingService.isSlotAvailable).toHaveBeenCalled();
      expect(bookingService.createNewBooking).toHaveBeenCalled();
      expect(notificationService.sendBookingConfirmationEmail).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it("should return an error if slot is not available", async () => {
      (bookingService.getSchedule as jest.Mock).mockResolvedValue({
        availability: { mon: ["09:00-17:00"] },
        bookings: [],
      });
      (bookingService.isSlotAvailable as jest.Mock).mockReturnValue({
        available: false,
        reason: "Slot taken",
      });

      const result = await createBooking(undefined, formData);

      expect(bookingService.createNewBooking).not.toHaveBeenCalled();
      expect(notificationService.sendBookingConfirmationEmail).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Slot taken");
    });

    it("should return an error for invalid form data", async () => {
      const invalidFormData = new FormData();
      invalidFormData.append("trainerId", "trainer-1");
      // missing fields
      const result = await createBooking(undefined, invalidFormData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid form data.");
    });
  });
});
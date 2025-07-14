import { prismaMock } from "../../../tests/singleton";
import * as notificationService from "./notificationService";
import { Resend } from "resend";

jest.mock("resend");

const mockResend = {
  emails: {
    send: jest.fn(),
  },
};
(Resend as jest.Mock).mockImplementation(() => mockResend);

describe("Notification Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("sendBookingConfirmationEmail", () => {
    it("should send two emails: one to the trainer and one to the client", async () => {
      const booking = {
        id: "booking-1",
        clientName: "Test Client",
        clientEmail: "client@test.com",
        startTime: new Date(),
        endTime: new Date(),
      };
      const trainer = { name: "Test Trainer", email: "trainer@test.com" };

      await notificationService.sendBookingConfirmationEmail(
        booking as any,
        trainer,
      );

      expect(mockResend.emails.send).toHaveBeenCalledTimes(2);

      // Check trainer email
      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: trainer.email,
          subject: `New Booking: ${booking.clientName}`,
        }),
      );

      // Check client email
      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: booking.clientEmail,
          subject: expect.stringContaining("is Confirmed!"),
        }),
      );
    });
  });

  describe("createMilestoneNotification", () => {
    const userId = "user-1";
    const clientId = "client-1";

    it("should create a notification when a session milestone is reached", async () => {
      prismaMock.clientSessionLog.count.mockResolvedValue(50);
      prismaMock.client.findUnique.mockResolvedValue({ name: "Test Client" } as any);

      await notificationService.createMilestoneNotification(userId, clientId);

      expect(prismaMock.notification.create).toHaveBeenCalled();
      expect(prismaMock.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: userId,
            message: expect.stringContaining(
              "Milestone reached! Client Test Client has completed 50 sessions.",
            ),
            type: "milestone",
          },
        }),
      );
    });

    it("should NOT create a notification for a non-milestone session count", async () => {
      prismaMock.clientSessionLog.count.mockResolvedValue(49);

      await notificationService.createMilestoneNotification(userId, clientId);

      expect(prismaMock.notification.create).not.toHaveBeenCalled();
    });
  });
});
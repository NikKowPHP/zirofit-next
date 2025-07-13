import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { BookingConfirmation } from "@/emails/BookingConfirmation";
import type { Booking } from "@prisma/client";

export const sendBookingConfirmationEmail = async (
  booking: Booking,
  trainer: { name: string | null; email: string },
) => {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  // 1. Send notification to trainer
  await resend.emails.send({
    from: "bookings@ziro.fit",
    to: trainer.email,
    subject: `New Booking: ${booking.clientName}`,
    html: `
            <h1>New Booking Notification</h1>
            <p>Hi ${trainer.name},</p>
            <p>You have a new booking from ${booking.clientName} (${booking.clientEmail}).</p>
            <p><strong>Details:</strong></p>
            <ul>
                <li>Date: ${new Date(booking.startTime).toLocaleDateString()}</li>
                <li>Time: ${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(booking.endTime).toLocaleTimeString()}</li>
                ${booking.clientNotes ? `<li>Notes: ${booking.clientNotes}</li>` : ""}
            </ul>
        `,
  });

  // 2. Send confirmation to client
  await resend.emails.send({
    from: "bookings@ziro.fit",
    to: booking.clientEmail,
    subject: `Your Training Session with ${trainer?.name || "your trainer"} is Confirmed!`,
    react: BookingConfirmation({
      trainerName: trainer?.name || "your trainer",
      bookingDate: new Date(booking.startTime).toLocaleDateString(),
      bookingTime: `${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(booking.endTime).toLocaleTimeString()}`,
      bookingLocation: "Your chosen location", // TODO: Replace with actual location if available
      cancellationLink: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel-booking/${booking.id}`,
    }),
  });
};

export const createMilestoneNotification = async (
  userId: string,
  clientId: string,
) => {
  const sessionCount = await prisma.clientSessionLog.count({
    where: { clientId },
  });

  const milestones = [5, 10, 20, 50, 100];
  if (milestones.includes(sessionCount)) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { name: true },
    });
    if (!client) return;
    await prisma.notification.create({
      data: {
        userId: userId,
        message: `🎉 Milestone reached! Client ${client.name} has completed ${sessionCount} sessions.`,
        type: "milestone",
      },
    });
  }
};

import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { BookingConfirmation } from "@/emails/BookingConfirmation";
import type { Booking } from "@prisma/client";
import { generateGoogleCalendarLink } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

/**
 * Sends booking confirmation emails to both the trainer and the client.
 */
export const sendBookingConfirmationEmail = async (
  booking: Booking,
  trainer: { name: string | null; email: string },
  locale: string,
) => {
  const t = await getTranslations({ locale, namespace: "Emails" });
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const calendarLink = generateGoogleCalendarLink(booking);
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  // 1. Send notification to trainer
  await resend.emails.send({
    from: "bookings@ziro.fit",
    to: trainer.email,
    subject: t("trainerNotificationSubject", { clientName: booking.clientName }),
    html: `
            <h1>${t("trainerNotificationHeading")}</h1>
            <p>${t("trainerNotificationSalutation", { trainerName: trainer.name || "Trainer" })}</p>
            <p>${t("trainerNotificationBody", { clientName: booking.clientName, clientEmail: booking.clientEmail })}</p>
            <p><strong>${t("trainerNotificationDetails")}</strong></p>
            <ul>
                <li>${t("trainerNotificationDate")} ${new Date(booking.startTime).toLocaleDateString(locale)}</li>
                <li>${t("trainerNotificationTime")} ${new Date(booking.startTime).toLocaleTimeString(locale, timeOptions)} - ${new Date(booking.endTime).toLocaleTimeString(locale, timeOptions)}</li>
                ${booking.clientNotes ? `<li>${t("trainerNotificationNotes")} ${booking.clientNotes}</li>` : ""}
            </ul>
            <p style="margin-top: 20px;">
              <a href="${calendarLink}" target="_blank" style="background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">${t("trainerNotificationCta")}</a>
            </p>
        `,
  });

  // 2. Send confirmation to client
  await resend.emails.send({
    from: "bookings@ziro.fit",
    to: booking.clientEmail,
    subject: t("clientConfirmationSubject", {
      trainerName: trainer?.name || "your trainer",
    }),
    react: BookingConfirmation({
      heading: t("clientConfirmationHeading"),
      hello: t("clientConfirmationHello"),
      body: t("clientConfirmationBody", {
        trainerName: trainer?.name || "your trainer",
      }),
      detailsHeading: t("clientConfirmationDetailsHeading"),
      dateLabel: t("clientConfirmationDate"),
      timeLabel: t("clientConfirmationTime"),
      locationLabel: t("clientConfirmationLocation"),
      bookingDate: new Date(booking.startTime).toLocaleDateString(locale),
      bookingTime: `${new Date(booking.startTime).toLocaleTimeString(locale, timeOptions)} - ${new Date(booking.endTime).toLocaleTimeString(locale, timeOptions)}`,
      bookingLocation: "Your chosen location", // TODO: Replace with actual location if available
      cancellationLink: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel-booking/${booking.id}`,
      cancellationLinkText: t("clientConfirmationCancellationLink"),
      cta: t("clientConfirmationCta"),
      contactText: t("clientConfirmationContact"),
      footerText: t("clientConfirmationFooter", {
        year: new Date().getFullYear(),
      }),
    }),
  });
};

/**
 * Creates an in-app notification for a new booking.
 */
export async function createBookingNotification(
  trainerId: string,
  booking: Booking,
  locale: string,
) {
  const message = `New booking from ${
    booking.clientName
  } on ${new Date(booking.startTime).toLocaleDateString(locale)}`;
  await prisma.notification.create({
    data: {
      userId: trainerId,
      message,
      type: "booking",
    },
  });
}

/**
 * Creates a notification for a trainer when a client reaches a session milestone.
 */
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
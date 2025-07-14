"use server";

import { z } from "zod";
import * as bookingService from "@/lib/services/bookingService";
import * as notificationService from "@/lib/services/notificationService";

export interface BookingFormState {
  message?: string;
  error?: string;
  success?: boolean;
}

const BookingSchema = z.object({
  trainerId: z.string(),
  startTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start time" }),
  endTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end time" }),
  clientName: z.string().min(2, "Name is required."),
  clientEmail: z.string().email("Invalid email address."),
  clientNotes: z.string().optional(),
});

export async function getTrainerSchedule(trainerId: string) {
  try {
    return await bookingService.getSchedule(trainerId);
  } catch (error) {
    console.error("Error fetching trainer schedule:", error);
    return { availability: {}, bookings: [] };
  }
}

export async function getTrainerBookings(trainerId: string) {
  return await bookingService.getBookings(trainerId);
}

export async function createBooking(
  prevState: BookingFormState | undefined,
  formData: FormData,
): Promise<BookingFormState> {
  const validatedFields = BookingSchema.safeParse({
    trainerId: formData.get("trainerId"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail"),
    clientNotes: formData.get("clientNotes"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid form data.", success: false };
  }

  const { trainerId, startTime, endTime, clientName, clientEmail, clientNotes } =
    validatedFields.data;

  try {
    // 1. Fetch trainer's availability and existing bookings
    const schedule = await bookingService.getSchedule(trainerId);
    const requestedStart = new Date(startTime);
    const requestedEnd = new Date(endTime);

    const { available, reason } = bookingService.isSlotAvailable(
      requestedStart,
      requestedEnd,
      schedule.availability,
      schedule.bookings,
    );

    if (!available) {
      return {
        error: reason,
        success: false,
      };
    }

    const booking = await bookingService.createNewBooking({
      trainerId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      clientName,
      clientEmail,
      clientNotes,
    });

    // Send in-app and email notifications
    try {
      // In-app notification for trainer dashboard
      await notificationService.createBookingNotification(trainerId, booking);

      // Email notifications
      const trainer = await bookingService.getTrainerForBooking(trainerId);
      if (trainer?.email) {
        await notificationService.sendBookingConfirmationEmail(
          booking,
          trainer,
        );
      }
    } catch (e: unknown) {
      console.error(
        `Failed to send booking notifications: ${e instanceof Error ? e.message : String(e)}`,
      );
      // Don't fail the booking if notifications fail, but log the error.
    }

    return { success: true, message: "Session booked successfully!" };
  } catch (e: unknown) {
    return {
      error: `Failed to create booking: ${e instanceof Error ? e.message : String(e)}`,
      success: false,
    };
  }
}
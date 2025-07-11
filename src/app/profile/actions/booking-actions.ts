"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

export interface BookingFormState {
  message?: string;
  error?: string;
  success?: boolean;
}

const BookingSchema = z.object({
  trainerId: z.string(),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start time" }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end time" }),
  clientName: z.string().min(2, "Name is required."),
  clientEmail: z.string().email("Invalid email address."),
  clientNotes: z.string().optional(),
});

export async function getTrainerSchedule(trainerId: string) {
    try {
        const profile = await prisma.profile.findFirst({
            where: { userId: trainerId },
            select: { availability: true },
        });

        const bookings = await prisma.booking.findMany({
            where: {
                trainerId: trainerId,
                startTime: { gte: new Date() }, // Only fetch future bookings
                status: "CONFIRMED",
            },
            select: { startTime: true, endTime: true },
        });

        return {
            availability: (profile?.availability as Record<string, string[]>) || {},
            bookings,
        };
    } catch (error) {
        console.error("Error fetching trainer schedule:", error);
        return { availability: {}, bookings: [] };
    }
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

    const { trainerId, startTime, endTime, clientName, clientEmail, clientNotes } = validatedFields.data;

    try {
        // 1. Fetch trainer's availability and existing bookings
        const { availability, bookings } = await getTrainerSchedule(trainerId);
        const requestedStart = new Date(startTime);
        const requestedEnd = new Date(endTime);

        // 2. Check if requested slot is within available hours
        const dayOfWeek = requestedStart.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
        const availableSlots: string[] | undefined = availability[dayOfWeek];

        if (!availableSlots || availableSlots.length === 0) {
            return {
                error: "Trainer is not available on this day.",
                success: false
            };
        }

        const isWithinAvailableHours = availableSlots.some((slot: string) => {
            const [start, end] = slot.split('-');
            const [startHour, startMin] = start.split(':').map(Number);
            const [endHour, endMin] = end.split(':').map(Number);

            const slotStart = new Date(requestedStart);
            slotStart.setHours(startHour, startMin, 0, 0);

            const slotEnd = new Date(requestedStart);
            slotEnd.setHours(endHour, endMin, 0, 0);

            return requestedStart >= slotStart && requestedEnd <= slotEnd;
        });

        if (!isWithinAvailableHours) {
            return {
                error: "Requested time is outside trainer's available hours.",
                success: false
            };
        }

        // 3. Check for overlapping bookings
        const hasOverlap = bookings.some(booking => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            return (
                (requestedStart >= bookingStart && requestedStart < bookingEnd) ||
                (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
                (requestedStart <= bookingStart && requestedEnd >= bookingEnd)
            );
        });

        if (hasOverlap) {
            return {
                error: "This time slot is already booked. Please choose another time.",
                success: false
            };
        }

        const booking = await prisma.booking.create({
            data: {
                trainerId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                clientName,
                clientEmail,
                clientNotes,
            },
        });

        // Send email notifications
        try {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY!);
            const { BookingConfirmation } = await import('@/emails/BookingConfirmation');

            // 1. Send notification to trainer
            const trainer = await prisma.user.findUnique({
                where: { id: trainerId },
                select: { email: true, name: true }
            });

            if (trainer?.email) {
                await resend.emails.send({
                    from: 'bookings@ziro.fit',
                    to: trainer.email,
                    subject: `New Booking: ${clientName}`,
                    html: `
                        <h1>New Booking Notification</h1>
                        <p>Hi ${trainer.name},</p>
                        <p>You have a new booking from ${clientName} (${clientEmail}).</p>
                        <p><strong>Details:</strong></p>
                        <ul>
                            <li>Date: ${new Date(startTime).toLocaleDateString()}</li>
                            <li>Time: ${new Date(startTime).toLocaleTimeString()} - ${new Date(endTime).toLocaleTimeString()}</li>
                            ${clientNotes ? `<li>Notes: ${clientNotes}</li>` : ''}
                        </ul>
                    `
                });
            }

            // 2. Send confirmation to client
            await resend.emails.send({
                from: 'bookings@ziro.fit',
                to: clientEmail,
                subject: `Your Training Session with ${trainer?.name || 'your trainer'} is Confirmed!`,
                react: BookingConfirmation({
                    trainerName: trainer?.name || 'your trainer',
                    bookingDate: new Date(startTime).toLocaleDateString(),
                    bookingTime: `${new Date(startTime).toLocaleTimeString()} - ${new Date(endTime).toLocaleTimeString()}`,
                    bookingLocation: 'Your chosen location', // TODO: Replace with actual location if available
                    cancellationLink: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel-booking/${booking.id}`
                })
            });
        } catch (e: unknown) {
            console.error(`Failed to send booking notification emails: ${e instanceof Error ? e.message : String(e)}`);
            // Don't fail the booking if emails fail
        }

        return { success: true, message: "Session booked successfully!" };
    } catch (e: unknown) {
        return { error: `Failed to create booking: ${e instanceof Error ? e.message : String(e)}`, success: false };
    }
}
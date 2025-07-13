import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const getSchedule = async (trainerId: string) => {
  const profile = await prisma.profile.findFirst({
    where: { userId: trainerId },
    select: { availability: true },
  });

  const bookings = await prisma.booking.findMany({
    where: {
      trainerId: trainerId,
      startTime: { gte: new Date() },
      status: "CONFIRMED",
    },
    select: { startTime: true, endTime: true },
  });

  return {
    availability: (profile?.availability as Record<string, string[]>) || {},
    bookings,
  };
};

export const getBookings = async (trainerId: string) => {
  return await prisma.booking.findMany({
    where: { trainerId },
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      clientName: true,
      clientEmail: true,
      clientNotes: true,
      status: true,
    },
  });
};

export const isSlotAvailable = (
  requestedStart: Date,
  requestedEnd: Date,
  availability: Record<string, string[]>,
  bookings: { startTime: Date; endTime: Date }[],
): { available: boolean; reason?: string } => {
  // Check if requested slot is within available hours
  const dayOfWeek = requestedStart
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase();
  const availableSlots: string[] | undefined = availability[dayOfWeek];

  if (!availableSlots || availableSlots.length === 0) {
    return {
      available: false,
      reason: "Trainer is not available on this day.",
    };
  }

  const isWithinAvailableHours = availableSlots.some((slot: string) => {
    const [start, end] = slot.split("-");
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    const slotStart = new Date(requestedStart);
    slotStart.setHours(startHour, startMin, 0, 0);

    const slotEnd = new Date(requestedStart);
    slotEnd.setHours(endHour, endMin, 0, 0);

    return requestedStart >= slotStart && requestedEnd <= slotEnd;
  });

  if (!isWithinAvailableHours) {
    return {
      available: false,
      reason: "Requested time is outside trainer's available hours.",
    };
  }

  // Check for overlapping bookings
  const hasOverlap = bookings.some((booking) => {
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
      available: false,
      reason: "This time slot is already booked. Please choose another time.",
    };
  }

  return { available: true };
};

export const createNewBooking = async (
  data: Prisma.BookingUncheckedCreateInput,
) => {
  return await prisma.booking.create({ data });
};

export const getTrainerForBooking = async (trainerId: string) => {
  return prisma.user.findUnique({
    where: { id: trainerId },
    select: { email: true, name: true },
  });
};
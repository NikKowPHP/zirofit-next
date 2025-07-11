"use client";

import { useState } from "react";
import { createBooking } from "@/app/profile/actions/booking-actions";
import { useFormState } from "react-dom";
import { Button, Input, Textarea } from "@/components/ui";

type ScheduleData = {
  availability: Record<string, string[]>;
  bookings: Array<{ startTime: Date; endTime: Date }>;
};

export default function PublicCalendar({
  trainerId,
  initialSchedule,
}: {
  trainerId: string;
  initialSchedule: ScheduleData;
}) {
  const [schedule] = useState<ScheduleData>(initialSchedule);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const [formState, formAction] = useFormState(createBooking, {
    success: false,
  });

  // Simplified logic to generate slots for the next 7 days
  const availableSlots = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date();
    day.setDate(day.getDate() + i);
    // Basic check, does not account for existing bookings yet
    if (
      schedule.availability[
        day.toLocaleDateString("en-CA", { weekday: "short" }).toLowerCase().slice(0, 3)
      ]
    ) {
      availableSlots.push(day);
    }
  }

  if (formState.success) {
    return (
      <div className="p-4 bg-green-100 text-green-700 rounded-md">
        {formState.message}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Book a Session</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {availableSlots.slice(0, 8).map(
          (
            slot, // Show first 8 available slots for demo
          ) => (
            <button
              key={slot.toISOString()}
              onClick={() => setSelectedSlot(slot)}
              className="p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {slot.toLocaleDateString()} @ 10:00 AM
            </button>
          ),
        )}
      </div>

      {selectedSlot && (
        <form action={formAction} className="mt-6 space-y-4 border-t pt-6">
          <h4 className="font-semibold">
            Confirm Booking for {selectedSlot.toLocaleString()}
          </h4>
          <input type="hidden" name="trainerId" value={trainerId} />
          <input
            type="hidden"
            name="startTime"
            value={selectedSlot.toISOString()}
          />
          <input
            type="hidden"
            name="endTime"
            value={
              new Date(selectedSlot.getTime() + 60 * 60 * 1000).toISOString()
            }
          />

          <div>
            <Input name="clientName" placeholder="Your Name" required />
          </div>
          <div>
            <Input name="clientEmail" type="email" placeholder="Your Email" required />
          </div>
          <div>
            <Textarea
              name="clientNotes"
              placeholder="Any notes for the trainer? (optional)"
            />
          </div>
          <Button type="submit">Confirm Booking</Button>
          {formState.error && <p className="text-red-500">{formState.error}</p>}
        </form>
      )}
    </div>
  );
}
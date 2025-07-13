"use client";

import React, { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateAvailability } from "@/app/profile/actions/availability-actions";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

interface AvailabilityEditorProps {
  initialAvailability: Record<string, string[]>; // Stored as JSON
}

const daysOfWeek = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const dayLabels: { [key: string]: string } = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Availability"}
    </Button>
  );
}

export default function AvailabilityEditor({ initialAvailability }: AvailabilityEditorProps) {
  const [schedule, setSchedule] = useState(initialAvailability || {});

  const [state, formAction] = useFormState(updateAvailability, {
    message: null,
    error: null,
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      // Handle success state if needed
    } else if (state.error) {
      // Handle error state if needed
    }
  }, [state]);

  const handleTimeChange = (day: string, index: number, value: string) => {
    const newSchedule = { ...schedule };
    if (!newSchedule[day]) newSchedule[day] = ["09:00-17:00"];
    
    const times = newSchedule[day][0].split('-');
    times[index] = value;
    newSchedule[day] = [times.join('-')];
    setSchedule(newSchedule);
  };

  const toggleDay = (day: string) => {
    const newSchedule = { ...schedule };
    if (newSchedule[day]) {
      delete newSchedule[day];
    } else {
      newSchedule[day] = ["09:00-17:00"]; // Default time
    }
    setSchedule(newSchedule);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Your Weekly Availability</CardTitle>
      </CardHeader>
      <CardContent>
        {state.success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-md">
            {state.message}
          </div>
        )}
        {state.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-md">
            {state.error}
          </div>
        )}

        <form action={formAction}>
          <input type="hidden" name="availability" value={JSON.stringify(schedule)} />

          <div className="space-y-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="flex items-center justify-between p-3 border rounded-md dark:border-gray-700">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`check-${day}`}
                    checked={!!schedule[day]}
                    onChange={() => toggleDay(day)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor={`check-${day}`} className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {dayLabels[day]}
                  </label>
                </div>
                {schedule[day] && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={schedule[day][0].split('-')[0]}
                      onChange={(e) => handleTimeChange(day, 0, e.target.value)}
                      className="w-28 p-1 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={schedule[day][0].split('-')[1]}
                      onChange={(e) => handleTimeChange(day, 1, e.target.value)}
                      className="w-28 p-1 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
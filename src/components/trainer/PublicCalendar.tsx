"use client";

import { useState, useActionState, useMemo } from "react";
import { createBooking } from "@/app/profile/actions/booking-actions";
import { Button, Input, Textarea } from "@/components/ui";
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    startOfWeek, 
    endOfWeek, 
    isSameMonth, 
    isToday, 
    addMonths, 
    subMonths,
    parse,
    isBefore,
    isAfter,
    set
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

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
  const [schedule] = useState<ScheduleData>({
    ...initialSchedule,
    bookings: initialSchedule.bookings.map(b => ({
        startTime: new Date(b.startTime),
        endTime: new Date(b.endTime)
    }))
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [formState, formAction] = useActionState(createBooking, {
    success: false,
  });
  
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(firstDayOfMonth),
    end: endOfWeek(lastDayOfMonth),
  });

  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToPrevMonth = () => {
    // Prevent going to past months
    if (!isSameMonth(currentDate, new Date())) {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const dayOfWeek = format(selectedDate, "EEE").toLowerCase();
    const dayAvailability = schedule.availability[dayOfWeek];
    if (!dayAvailability || dayAvailability.length === 0) return [];
    
    const [startTimeStr, endTimeStr] = dayAvailability[0].split('-');
    const slotDuration = 60; // in minutes

    const dayStart = parse(startTimeStr, 'HH:mm', selectedDate);
    const dayEnd = parse(endTimeStr, 'HH:mm', selectedDate);

    const slots = [];
    let currentTime = dayStart;
    while(isBefore(currentTime, dayEnd)) {
        const slotStart = currentTime;
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

        if (isAfter(slotEnd, dayEnd)) break;

        const isBooked = schedule.bookings.some(booking => {
            const bookingStart = booking.startTime;
            const bookingEnd = booking.endTime;
            // A slot is booked if it overlaps with an existing booking.
            // Overlap exists if (StartA < EndB) and (StartB < EndA).
            return isBefore(slotStart, bookingEnd) && isBefore(bookingStart, slotEnd);
        });

        if (!isBooked && isAfter(slotStart, new Date())) {
            slots.push(format(slotStart, "HH:mm"));
        }
        
        currentTime = new Date(currentTime.getTime() + slotDuration * 60 * 1000);
    }
    
    return slots;
  }, [selectedDate, schedule.availability, schedule.bookings]);

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setSelectedTime(null);
  };

  const getStartTime = () => {
    if (!selectedDate || !selectedTime) return null;
    const [hours, minutes] = selectedTime.split(':').map(Number);
    return set(selectedDate, { hours, minutes });
  };
  
  const getEndTime = () => {
      const startTime = getStartTime();
      if (!startTime) return null;
      return new Date(startTime.getTime() + 60 * 60 * 1000);
  };

  if (formState.success) {
    return (
      <div className="p-4 bg-green-100 text-green-700 rounded-md">
        {formState.message}
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Book a Session</h3>
      
      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
            <button 
              onClick={goToPrevMonth} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              disabled={isSameMonth(currentDate, new Date())}
            >
                <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h4 className="font-semibold text-lg">{format(currentDate, "MMMM yyyy")}</h4>
            <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <ChevronRightIcon className="h-5 w-5" />
            </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-2">
            {daysInMonth.map(day => {
                const dayOfWeek = format(day, "EEE").toLowerCase();
                const isPast = isBefore(day, today);
                const hasAvailability = !!schedule.availability[dayOfWeek];
                const isAvailable = hasAvailability && !isPast;
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                    <button 
                        key={day.toString()}
                        onClick={() => isAvailable && handleDateClick(day)}
                        disabled={!isAvailable}
                        className={`
                            w-11 h-11 rounded-full text-sm flex items-center justify-center transition-colors
                            ${isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}
                            ${isToday(day) && 'bg-indigo-100 dark:bg-indigo-900'}
                            ${selectedDate?.getTime() === day.getTime() ? 'bg-indigo-600 text-white' : ''}
                            ${isAvailable && isCurrentMonth ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                            ${!isCurrentMonth && 'opacity-50'}
                        `}
                    >
                        {format(day, 'd')}
                    </button>
                )
            })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
          <div className="mt-4">
              <h4 className="font-semibold">Available slots for {format(selectedDate, "MMMM d, yyyy")}</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                  {availableTimeSlots.length > 0 ? availableTimeSlots.map(time => (
                      <button 
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`
                              py-3 px-2 border rounded-full text-sm transition-colors
                              ${selectedTime === time ? 'bg-indigo-600 text-white border-indigo-600' : 'border-neutral-300 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-gray-700'}
                          `}
                      >
                          {time}
                      </button>
                  )) : (
                      <p className="text-gray-500 col-span-full">No available slots for this day.</p>
                  )}
              </div>
          </div>
      )}

      {/* Booking Form */}
      {selectedDate && selectedTime && (
        <form action={formAction} className="mt-6 space-y-4 border-t pt-6">
          <h4 className="font-semibold">
            Confirm Booking for {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
          </h4>
          <input type="hidden" name="trainerId" value={trainerId} />
          <input
            type="hidden"
            name="startTime"
            value={getStartTime()?.toISOString() || ''}
          />
          <input
            type="hidden"
            name="endTime"
            value={getEndTime()?.toISOString() || ''}
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

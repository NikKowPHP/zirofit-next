
"use client";

import { useState, useMemo, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createBooking } from "@/app/[locale]/profile/actions/booking-actions";
import { Button, Input, Textarea, CardContent, CardHeader, CardTitle } from "@/components/ui";
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
import { enUS, pl } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

type ScheduleData = {
  availability: Record<string, string[]>;
  bookings: Array<{ startTime: Date; endTime: Date }>;
};

function SubmitButton() {
  const t = useTranslations('PublicCalendar');
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending} data-testid="booking-confirm-button">
      {pending ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {t('confirming')}
        </>
      ) : (
        t('confirmBooking')
      )}
    </Button>
  );
}


export default function PublicCalendar({
  trainerId,
  initialSchedule,
}: {
  trainerId: string;
  initialSchedule: ScheduleData;
}) {
  const t = useTranslations('PublicCalendar');
  const locale = useLocale();
  const fnsLocale = locale === 'pl' ? pl : enUS;

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

  const [formState, formAction] = useFormState(createBooking, {
    success: false,
  });
  
  useEffect(() => {
    if (formState.success && formState.message) {
      toast.success(formState.message);
      setSelectedDate(null);
      setSelectedTime(null);
    } else if (formState.error) {
      toast.error(formState.error);
    }
  }, [formState]);

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(firstDayOfMonth, { locale: fnsLocale }),
    end: endOfWeek(lastDayOfMonth, { locale: fnsLocale }),
  });

  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToPrevMonth = () => {
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
      <CardContent>
        <div className="p-4 mt-6 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-md text-center">
            <h3 className="font-semibold">{t('bookingConfirmedTitle')}</h3>
            <p className="text-sm">{t('bookingConfirmedDescription')}</p>
        </div>
      </CardContent>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <>
      <CardHeader>
        <CardTitle data-testid="booking-heading">{t('heading')}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Calendar */}
        <div className="p-0">
          <div className="flex justify-between items-center mb-4">
              <Button 
                onClick={goToPrevMonth}
                variant="secondary" 
                size="sm"
                disabled={isSameMonth(currentDate, new Date())}
                aria-label={t('prevMonth')}
              >
                  <ChevronLeftIcon className="h-5 w-5" />
              </Button>
              <h4 className="font-semibold text-lg">{format(currentDate, "MMMM yyyy", { locale: fnsLocale })}</h4>
              <Button onClick={goToNextMonth} variant="secondary" size="sm" aria-label={t('nextMonth')}>
                  <ChevronRightIcon className="h-5 w-5" />
              </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day}>{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 mt-2" data-testid="calendar-grid">
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
                              w-10 h-10 rounded-full text-sm flex items-center justify-center transition-colors text-neutral-800 dark:text-neutral-200
                              ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-500' : ''}
                              ${isToday(day) && !isPast && 'font-bold'}
                              ${selectedDate?.getTime() === day.getTime() ? 'bg-[var(--primary-blue)] text-white hover:bg-[var(--primary-blue)]' : ''}
                              ${isAvailable && isCurrentMonth ? 'hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer' : 'cursor-not-allowed opacity-40'}
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
                <h4 className="font-semibold text-sm mb-2" data-testid="available-slots-heading">{t('availableSlotsFor', { date: format(selectedDate, "MMMM d, yyyy", { locale: fnsLocale })})}</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" data-testid="time-slot-container">
                    {availableTimeSlots.length > 0 ? availableTimeSlots.map(time => (
                        <Button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            variant={selectedTime === time ? "primary" : "secondary"}
                            size="sm"
                            data-testid="available-time-slot"
                        >
                            {time}
                        </Button>
                    )) : (
                        <p className="text-gray-500 col-span-full text-sm">{t('noSlots')}</p>
                    )}
                </div>
            </div>
        )}

        {/* Booking Form */}
        {selectedDate && selectedTime && (
          <form action={formAction} className="mt-6 space-y-4 border-t dark:border-neutral-800 pt-6">
            <h4 className="font-semibold text-sm">
              {t('confirmFor', { date: format(selectedDate, 'MMMM d, yyyy', { locale: fnsLocale }), time: selectedTime })}
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
              <Input name="clientName" placeholder={t('yourNamePlaceholder')} required data-testid="booking-name-input" />
            </div>
            <div>
              <Input name="clientEmail" type="email" placeholder={t('yourEmailPlaceholder')} required data-testid="booking-email-input" />
            </div>
            <div>
              <Textarea
                name="clientNotes"
                placeholder={t('notesPlaceholder')}
                rows={3}
              />
            </div>
            <SubmitButton />
          </form>
        )}
      </CardContent>
    </>
  );
}
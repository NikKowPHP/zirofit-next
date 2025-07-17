
import { createClient } from "@/lib/supabase/server";
import { getTrainerBookings } from "../../profile/actions/booking-actions";
import { generateGoogleCalendarLink } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Booking } from "@prisma/client";
interface PageProps {
  params: Promise<{
    
    locale: string;
  }>;
}
export default async function BookingsPage({ params }: PageProps) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const bookings = await getTrainerBookings(user.id);

  return (
    <div className="space-y-4">
      {bookings.length === 0 && (
        <p className="text-center py-8 text-gray-500">
          You have no upcoming bookings.
        </p>
      )}
      {bookings.map((booking) => {
        const calendarLink = generateGoogleCalendarLink(booking as Booking);
        return (
          <div
            key={booking.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            data-testid={`booking-card-${booking.id}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{booking.clientName}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {booking.clientEmail}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  booking.status === "CONFIRMED"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                <strong>Time:</strong>{" "}
                {new Date(booking.startTime).toLocaleString(locale, {
                  dateStyle: "long",
                  timeStyle: "short",
                })}{" "}
                -{" "}
                {new Date(booking.endTime).toLocaleTimeString(locale, {
                  timeStyle: "short",
                })}
              </p>
              {booking.clientNotes && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <strong>Notes:</strong> {booking.clientNotes}
                </p>
              )}
              <div className="flex justify-end mt-4">
                <Button asChild variant="secondary" size="sm">
                  <Link href={calendarLink} target="_blank" data-testid={`add-to-calendar-link-${booking.id}`}>
                    Add to Calendar
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
### work_breakdown/tasks/plan-phase-C-booking-flow.md
# **Phase C: Public Booking Flow & Trainer Management**

**Goal:** To enable the end-to-end booking functionality. This involves creating the public calendar UI on trainer profiles, implementing the booking creation logic, and providing a dashboard for trainers to view their appointments.

---

### 1. Booking Creation Logic

-   `[x]` **Task 1.1: Create Server Actions for Booking**

    -   **File:** `src/app/profile/actions.ts`
    -   **Action:** Add two new server actions: `getTrainerSchedule` to fetch availability and existing bookings, and `createBooking` to handle the creation of new appointments.
    -   **Content:**
        ```typescript
        // Add towards the end of src/app/profile/actions.ts

        // Schema for booking form validation
        const BookingSchema = z.object({
          trainerId: z.string(),
          startTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start time" }),
          endTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end time" }),
          clientName: z.string().min(2, "Name is required."),
          clientEmail: z.string().email("Invalid email address."),
          clientNotes: z.string().optional(),
        });
        
        interface BookingFormState {
          message?: string;
          error?: string;
          success?: boolean;
        }

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
              availability: profile?.availability as any || {},
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
          const validatedFields = BookingSchema.safeParse(Object.fromEntries(formData.entries()));
        
          if (!validatedFields.success) {
            return { error: "Invalid form data.", success: false };
          }
        
          const { trainerId, startTime, endTime, clientName, clientEmail, clientNotes } = validatedFields.data;
          
          // TODO: Add server-side validation here to ensure the chosen slot is valid
          // 1. Fetch trainer's availability and existing bookings.
          // 2. Check if the requested slot falls within an available window.
          // 3. Check if the requested slot overlaps with any existing bookings.
          // 4. If not valid, return an error state.
        
          try {
            await prisma.booking.create({
              data: {
                trainerId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                clientName,
                clientEmail,
                clientNotes,
              },
            });
        
            // TODO: Trigger email notification to trainer here
        
            return { success: true, message: "Session booked successfully!" };
          } catch (e: any) {
            return { error: "Failed to create booking.", success: false };
          }
        }
        ```

---

### 2. Public-Facing Booking UI

-   `[x]` **Task 2.1: Create Public Calendar Component**
    -   **File:** `src/components/trainer/PublicCalendar.tsx`
    -   **Action:** Create a new client component to display a trainer's availability and handle the booking form.
    -   **Content:**
        ```tsx
        // src/components/trainer/PublicCalendar.tsx
        "use client";

        import { useState, useEffect } from "react";
        import { getTrainerSchedule, createBooking } from "@/app/profile/actions";
        import { useFormState, useFormStatus } from "react-dom";
        import { Button, Input, Textarea } from "@/components/ui";

        // This is a simplified representation. A real implementation would need a more robust calendar library.
        export default function PublicCalendar({ trainerId }: { trainerId: string }) {
          const [schedule, setSchedule] = useState<{ availability: any, bookings: any[] }>({ availability: {}, bookings: [] });
          const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

          useEffect(() => {
            getTrainerSchedule(trainerId).then(setSchedule);
          }, [trainerId]);
          
          const [formState, formAction] = useFormState(createBooking, { success: false });

          // Simplified logic to generate slots for the next 7 days
          const availableSlots = [];
          for (let i = 0; i < 7; i++) {
              const day = new Date();
              day.setDate(day.getDate() + i);
              // Basic check, does not account for existing bookings yet
              if (schedule.availability[day.toLocaleDateString('en-CA', { weekday: 'short' }).toLowerCase().slice(0, 3)]) {
                  availableSlots.push(day);
              }
          }

          if (formState.success) {
              return <div className="p-4 bg-green-100 text-green-700 rounded-md">{formState.message}</div>
          }

          return (
            <div>
              <h3 className="text-xl font-bold mb-4">Book a Session</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.slice(0, 8).map(slot => ( // Show first 8 available slots for demo
                    <button key={slot.toISOString()} onClick={() => setSelectedSlot(slot)} className="p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        {slot.toLocaleDateString()} @ 10:00 AM
                    </button>
                ))}
              </div>

              {selectedSlot && (
                  <form action={formAction} className="mt-6 space-y-4 border-t pt-6">
                      <h4 className="font-semibold">Confirm Booking for {selectedSlot.toLocaleString()}</h4>
                      <input type="hidden" name="trainerId" value={trainerId} />
                      <input type="hidden" name="startTime" value={selectedSlot.toISOString()} />
                      <input type="hidden" name="endTime" value={new Date(selectedSlot.getTime() + 60*60*1000).toISOString()} />
                      
                      <div>
                          <Input name="clientName" placeholder="Your Name" required/>
                      </div>
                      <div>
                          <Input name="clientEmail" type="email" placeholder="Your Email" required/>
                      </div>
                      <div>
                          <Textarea name="clientNotes" placeholder="Any notes for the trainer? (optional)"/>
                      </div>
                      <Button type="submit">Confirm Booking</Button>
                      {formState.error && <p className="text-red-500">{formState.error}</p>}
                  </form>
              )}
            </div>
          );
        }
        ```

-   `[x]` **Task 2.2: Add Calendar to Trainer Profile Page**
    -   **File:** `src/app/trainer/[username]/page.tsx`
    -   **Action:** Import and render the `PublicCalendar` component, passing the trainer's ID to it.
    -   **Content:**
        ```tsx
        // Add this import
        import PublicCalendar from "@/components/trainer/PublicCalendar";

        // ... inside the TrainerProfilePage component, before the closing </PublicLayout> tag
        // e.g., replacing the existing contact form section
        
        <section id="contact-section" className="py-16 md:py-24 bg-white dark:bg-gray-900">
            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
                <PublicCalendar trainerId={userWithProfile.id} />
            </div>
        </section>
        ```

---

### 3. Trainer-Facing Booking Management

-   `[x]` **Task 3.1: Create Trainer Bookings Dashboard Page**

    -   **File:** `src/app/dashboard/bookings/page.tsx`
    -   **Action:** Create a new page for trainers to view their bookings.
    -   **Content:**
        ```tsx
        // src/app/dashboard/bookings/page.tsx
        import { createClient } from "@/lib/supabase/server";
        import { prisma } from "@/lib/prisma";
        import TrainerDashboardLayout from "@/components/layouts/TrainerDashboardLayout";
        
        async function getTrainerBookings(trainerId: string) {
            return await prisma.booking.findMany({
                where: { trainerId },
                orderBy: { startTime: 'asc' },
            });
        }
        
        export default async function BookingsPage() {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return null;

            const bookings = await getTrainerBookings(user.id);
            
            return (
                <TrainerDashboardLayout headerTitle="My Bookings">
                    <div className="space-y-4">
                        {bookings.length === 0 && <p>You have no upcoming bookings.</p>}
                        {bookings.map((booking) => (
                            <div key={booking.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <p><strong>Client:</strong> {booking.clientName} ({booking.clientEmail})</p>
                                <p><strong>Time:</strong> {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleTimeString()}</p>
                                <p><strong>Status:</strong> {booking.status}</p>
                                {booking.clientNotes && <p className="mt-2 text-sm italic">Notes: {booking.clientNotes}</p>}
                            </div>
                        ))}
                    </div>
                </TrainerDashboardLayout>
            )
        }
        ```

-   `[ ]` **Task 3.2: Add Link to Bookings Dashboard**
    -   **File:** `src/components/layouts/TrainerDashboardLayout.tsx`
    -   **Action:** Add a new navigation item to the sidebar pointing to the new bookings page.
    -   **Content:**
        ```tsx
        // Add CalendarDaysIcon to the import
        import {
          // ...
          CalendarDaysIcon,
        } from "@heroicons/react/24/outline";

        // Add a new item to the navigation array
        {
          name: "My Bookings",
          href: "/dashboard/bookings",
          icon: CalendarDaysIcon,
          current: pathname === "/dashboard/bookings",
        },
        ```
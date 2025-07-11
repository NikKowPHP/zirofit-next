### work_breakdown/tasks/plan-phase-A-db-and-backend.md
# **Phase A: Database & Backend Foundation for Booking**

**Goal:** To modify the database schema to support bookings and trainer availability, and to implement the backend logic and UI for trainers to manage their weekly schedules. After this phase, the database will be ready to store bookings, and trainers will have a functional interface in their dashboard to set their working hours.

---

### 1. Database Schema Evolution

-   `[x]` **Task 1.1: Update Prisma Schema for Bookings and Availability**

    -   **File:** `prisma/schema.prisma`
    -   **Action:** Add the new `Booking` model. Add the `availability` field to the `Profile` model. Add the `bookings` relation to the `User` model.
    -   **Content:**
        ```prisma
        // In the User model, add the bookings relation:
        model User {
          //... existing fields
          bookings           Booking[] // Relation to bookings made with this trainer
        }
        
        // In the Profile model, add the availability field:
        model Profile {
          //... existing fields
          availability       Json?     // e.g., { "mon": ["09:00-17:00"], "tue": ["..."] }
          socialLinks        SocialLink[]
        }
        
        // Add the new Booking model to the end of the file:
        model Booking {
          id          String   @id @default(cuid())
          startTime   DateTime
          endTime     DateTime
          status      String   @default("CONFIRMED") // e.g., CONFIRMED, CANCELLED
        
          trainerId   String
          trainer     User     @relation(fields: [trainerId], references: [id], onDelete: Cascade)
        
          // Details of the person who booked, not a formal client record yet
          clientName  String
          clientEmail String
          clientNotes String?  @db.Text
        
          createdAt   DateTime @default(now())
          updatedAt   DateTime @updatedAt
        
          @@index([trainerId, startTime, endTime])
        }
        ```

-   `[x]` **Task 1.2: Apply Database Migration**
    -   **Action:** Run the Prisma migration command to generate a new migration file and apply the schema changes to the development database.
    -   **Command:**
        ```bash
        npx prisma migrate dev --name add_booking_and_availability
        ```

---

### 2. Trainer Availability Management

-   `[x]` **Task 2.1: Add Server Action for Availability**

    -   **File:** `src/app/profile/actions.ts`
    -   **Action:** Add a new exported server action, `updateAvailability`, to handle updating the `availability` JSON field on a trainer's profile. Include Zod validation for the schedule structure.
    -   **Content:** Add the following function and related types to the file.
        ```typescript
        // At the top of the file, with other Zod schemas
        const AvailabilitySchema = z.object({
          // Expects a string that can be parsed into a JSON object
          availability: z.string().transform((str, ctx) => {
            try {
              const parsed = JSON.parse(str);
              // Add more specific validation for the object structure if needed
              return parsed;
            } catch (e) {
              ctx.addIssue({ code: "custom", message: "Invalid JSON format" });
              return z.NEVER;
            }
          }),
        });

        // Interface for the form state
        interface AvailabilityFormState {
          message?: string | null;
          error?: string | null;
          success?: boolean;
        }

        // The new server action
        export async function updateAvailability(
          prevState: AvailabilityFormState | undefined,
          formData: FormData
        ): Promise<AvailabilityFormState> {
          const { profile } = await getUserAndProfile();
        
          const validatedFields = AvailabilitySchema.safeParse({
            availability: formData.get("availability"),
          });
        
          if (!validatedFields.success) {
            return {
              error: "Invalid availability data provided.",
              success: false,
            };
          }
        
          try {
            await prisma.profile.update({
              where: { id: profile.id },
              data: {
                availability: validatedFields.data.availability,
              },
            });
        
            revalidatePath("/profile/edit");
            return {
              success: true,
              message: "Your availability has been updated successfully!",
            };
          } catch (e: any) {
            console.error("Failed to update availability:", e);
            return {
              error: "An unexpected error occurred while saving your availability.",
              success: false,
            };
          }
        }
        ```

-   `[x]` **Task 2.2: Create Availability Editor UI Component**

    -   **File:** `src/components/profile/sections/AvailabilityEditor.tsx`
    -   **Action:** Create a new file for the availability editor. This component will provide a form for trainers to manage their weekly schedule.
    -   **Content:**
        ```tsx
        // src/components/profile/sections/AvailabilityEditor.tsx
        "use client";

        import React, { useState, useEffect } from "react";
        import { useFormState, useFormStatus } from "react-dom";
        import { updateAvailability } from "@/app/profile/actions";
        import { Button } from "@/components/ui/Button";

        interface AvailabilityEditorProps {
          initialAvailability: any; // Stored as JSON
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
            // Handle success/error messages if needed
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
            <div className="p-6 bg-white dark:bg-gray-800 shadow-sm rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Set Your Weekly Availability
              </h3>
              
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
            </div>
          );
        }
        ```

-   `[ ]` **Task 2.3: Integrate Availability Editor into Profile Dashboard**

    -   **File:** `src/components/profile/ProfileEditorSidebar.tsx`
    -   **Action:** Add a new entry to the `sections` array for "Availability".
    -   **Content:**
        ```tsx
        // In the sections array, add a new object.
        // For example, after "External Links"
        { id: "links", name: "External Links", icon: LinkIcon },
        { id: "availability", name: "Availability", icon: CalendarDaysIcon }, // Use an appropriate icon
        
        // Don't forget to import the icon:
        import {
          // ... other icons
          CalendarDaysIcon,
        } from "@heroicons/react/24/outline";
        ```

    -   **File:** `src/components/profile/ProfileEditorLayout.tsx`
    -   **Action:** Import the new `AvailabilityEditor` and add it to the `sectionComponents` map.
    -   **Content:**
        ```tsx
        // At top with other lazy imports
        const AvailabilityEditor = React.lazy(
          () => import("./sections/AvailabilityEditor")
        );
        
        // ... inside the ProfileEditorLayout component ...
        
        // Add to the sectionComponents map
        const sectionComponents: { [key: string]: React.ComponentType<unknown> } = {
            // ... other sections
            links: () => (
              // ... links editor
            ),
            availability: () => (
              <AvailabilityEditor
                initialAvailability={initialData.profile?.availability || {}}
              />
            ),
            "social-links": () => (
              // ... social links editor
            ),
          };
        ```
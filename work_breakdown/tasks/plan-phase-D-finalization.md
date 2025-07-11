### work_breakdown/tasks/plan-phase-D-finalization.md
# **Phase D: Final Integration, Notifications & Testing**

**Goal:** To solidify the marketplace features by implementing robust booking validation, adding an efficient email notification system for trainers, and performing end-to-end testing of the entire search-to-book user flow to ensure the new features are stable and production-ready.

---

### 1. Booking Logic Hardening & Notifications

-   `[x]` **Task 1.1: Implement Robust Booking Validation**

    -   **File:** `src/app/profile/actions.ts`
    -   **Action:** Enhance the `createBooking` server action with comprehensive server-side validation to prevent double-bookings or scheduling outside of available hours.
    -   **Details:**
        1.  Inside `createBooking`, before creating the record, fetch the trainer's `availability` schedule and all existing `bookings` around the requested date using Prisma.
        2.  Implement a helper function to check if the requested `startTime` and `endTime` fall within one of the trainer's available weekly slots (from the `availability` JSON).
        3.  Implement a second helper function to check if the requested slot overlaps with any existing bookings for that trainer.
        4.  If either check fails, return a specific error message in the form state (e.g., `{ error: "This time slot is no longer available. Please select another.", success: false }`).

-   `[x]` **Task 1.2: Install Email Service Dependency**

    -   **Action:** Run the following shell command to install the `resend` library.
    -   **Command:**
        ```bash
        npm install resend
        ```

-   `[x]` **Task 1.3: Implement Email Notification on New Booking**

    -   **File:** `src/app/profile/actions.ts`
    -   **Action:** Update the `createBooking` action to send a transactional email to the trainer upon successful booking creation.
    -   **Details:**
        -   After `prisma.booking.create` succeeds, fetch the trainer's `User` record to get their email address.
        -   Initialize the Resend client using an environment variable (`RESEND_API_KEY`).
        -   Construct and send an email containing the booking details (client name, email, time, notes).
        -   Wrap the email logic in a `try...catch` block to ensure that an email failure does not cause the entire booking action to fail. Log any email errors to the console.

-   `[ ]` **Task 1.4: Add Environment Variables**
    -   **File:** `.env`
    -   **Action:** Add the new environment variable required for the email service.
    -   **Content:**
        ```
        # .env
        RESEND_API_KEY=your_resend_api_key_goes_here
        ```

---

### 2. Search Results Page UI Enhancements

-   `[ ]` **Task 2.1: Create `TrainerResultCard` Component**

    -   **File:** `src/components/trainers/TrainerResultCard.tsx`
    -   **Action:** Create a new component to serve as the main display card on the search results page, replacing the current placeholder. This component will be static for this phase.
    -   **Content:**
        ```tsx
        // src/components/trainers/TrainerResultCard.tsx
        import Link from 'next/link';
        import Image from 'next/image';

        interface TrainerCardProps {
          trainer: {
            id: string;
            name: string;
            username: string | null;
            profile: {
              location: string | null;
              certifications: string | null;
              profilePhotoPath: string | null;
            } | null;
          };
        }
        
        export default function TrainerResultCard({ trainer }: TrainerCardProps) {
          if (!trainer.profile) return null;
        
          return (
            <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex-shrink-0">
                <Image
                  src={trainer.profile.profilePhotoPath || '/default-profile.jpg'}
                  alt={trainer.name}
                  width={120}
                  height={120}
                  className="rounded-full object-cover w-24 h-24 md:w-32 md:h-32"
                />
              </div>
              <div className="flex-grow">
                <Link href={`/trainer/${trainer.username}`}>
                  <h2 className="text-xl font-bold text-indigo-600 hover:underline">{trainer.name}</h2>
                </Link>
                <p className="font-semibold">{trainer.profile.certifications}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{trainer.profile.location}</p>
                {/* Mini-calendar will be integrated here later if needed */}
              </div>
              <div className="md:w-1/3">
                 <Link href={`/trainer/${trainer.username}`} className="block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    View Profile & Book
                 </Link>
              </div>
            </div>
          );
        }
        ```
-   `[ ]` **Task 2.2: Integrate `TrainerResultCard` into Search Page**
    -   **File:** `src/app/trainers/page.tsx`
    -   **Action:** Import and use the new `TrainerResultCard` component to render the search results.
    -   **Details:**
        -   Import `TrainerResultCard` at the top of the file.
        -   In the `map` function, replace the placeholder `div` with `<TrainerResultCard trainer={trainer} />`.
---

### 3. End-to-End Testing (Manual)

-   `[ ]` **Task 3.1: Test Full Search & Book Flow**
    -   **Action:** Perform a complete manual test of the entire user journey from searching to booking.
    -   **Steps:**
        1.  **Set Availability:** Log in as a trainer. Navigate to the profile editor. Select the "Availability" tab and set a schedule for the upcoming week. Save the changes.
        2.  **Search:** Log out. Go to the homepage. Use the search bar to find the trainer you just configured. Verify that the search results on `/trainers` are accurate.
        3.  **View Profile:** Click on the trainer's profile link from the search results.
        4.  **Book Session:** On the trainer's public profile, find the "Book a Session" section. Verify the calendar shows the correct available slots. Select a slot.
        5.  **Submit Form:** Fill out the booking form with test client details and submit.
        6.  **Verify Success:** Confirm that a success message appears on the screen.
        7.  **Check Email:** Check the trainer's email inbox to confirm a notification email was received with the correct booking details.
        8.  **Verify Dashboard:** Log back in as the trainer. Navigate to the "My Bookings" dashboard page. Verify the new booking is listed correctly.
        9.  **Test Validation:** As a public user, try to book the *same slot again*. Verify that the form now shows an error message stating the slot is unavailable.

-   `[ ]` **Task 3.2: Test Edge Cases**
    -   **Action:** Test for potential issues and edge cases.
    -   **Steps:**
        1.  Search for a trainer that does not exist and verify the "No trainers found" message appears.
        2.  Try to submit the booking form with invalid data (e.g., bad email format) and check for validation messages.
        3.  As a trainer, set a day as unavailable and confirm no slots appear for that day on the public calendar.
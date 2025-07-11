Of course. Here is the fully revised and detailed plan for **Phase B**, meticulously updated to reflect the actual code implemented in Stage 1.

This new plan is no longer a generic setup guide; it is a targeted testing strategy designed to validate the complex business logic that now exists in the application, such as booking validation, advanced search, and dashboard data aggregation.

---
### `work_breakdown/tasks_stage_2/plan-phase-B-testing-setup.md`
# **Phase B: Comprehensive Test Suite Implementation (REVISED)**

**Goal:** Expand the test suite to provide comprehensive coverage for all critical business logic implemented in Stage 1, including booking validation, search filtering, and dashboard data services, to prevent regressions and ensure backend stability.

---

### 1. Test Environment Enhancement

-   `[ ]` **Task 1.1: Install Testing Utility**
    -   **Action:** Install `jest-mock-extended`, a library that simplifies creating deep mocks for complex objects like the Prisma client.
    -   **Command:** `npm install --save-dev jest-mock-extended`

-   `[ ]` **Task 1.2: Create Singleton Prisma Mock**
    -   **Action:** Create a reusable, singleton instance of a mocked Prisma client. This ensures that all tests across the suite use the same mock instance, which can be configured on a per-test basis.
    -   **File:** `tests/singleton.ts`
    -   **Content:**
        ```typescript
        // tests/singleton.ts
        import { PrismaClient } from '@prisma/client'
        import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
        import { prisma } from '@/lib/prisma'

        jest.mock('@/lib/prisma', () => ({
          __esModule: true,
          prisma: mockDeep<PrismaClient>(),
        }))

        beforeEach(() => {
          mockReset(prismaMock)
        })

        export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
        ```

-   `[ ]` **Task 1.3: Update Jest Setup for Singleton Mock**
    -   **File:** `jest.setup.js`
    -   **Action:** Import the new singleton mock setup file to ensure it runs before every test suite.
    -   **Content:**
        ```javascript
        // jest.setup.js
        const fetch = require('node-fetch');
        global.fetch = fetch;
        global.Request = fetch.Request;
        global.Response = fetch.Response;
        global.Headers = fetch.Headers;
        require('@testing-library/jest-dom');
        const { TextEncoder, TextDecoder } = require('util');
        global.TextEncoder = TextEncoder;
        global.TextDecoder = TextDecoder;
        
        require('./tests/singleton'); // Add this line

        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://mock-url.com';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-key-valid-format';
        ```

---

### 2. Core Business Logic Test Implementation

-   `[ ]` **Task 2.1: Create Test for Booking Validation Logic**
    -   **Action:** Create a new test file to verify the `createBooking` server action correctly handles scheduling conflicts and availability rules.
    -   **File:** `src/app/profile/actions/booking-actions.test.ts`
    -   **Content:**
        ```typescript
        // src/app/profile/actions/booking-actions.test.ts
        import { createBooking } from './booking-actions';
        import { prismaMock } from '../../../../tests/singleton';

        // Mock Next.js and Resend dependencies
        jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
        jest.mock('resend', () => ({ Resend: jest.fn().mockReturnValue({ emails: { send: jest.fn().mockResolvedValue({}) } }) }));

        describe('Booking Server Actions', () => {
          const baseFormData = new FormData();
          baseFormData.append('trainerId', 'trainer-1');
          baseFormData.append('clientName', 'Test Client');
          baseFormData.append('clientEmail', 'test@example.com');

          beforeEach(() => {
            // Mock a successful trainer lookup for all tests in this suite
            prismaMock.user.findUnique.mockResolvedValue({ id: 'trainer-1', name: 'Test Trainer', email: 'trainer@test.com' } as any);
          });

          it('should REJECT a booking that overlaps with an existing appointment', async () => {
            const formData = new FormData(baseFormData.getOwnerDocument().createElement("form"));
            formData.append('startTime', '2025-10-10T10:00:00.000Z');
            formData.append('endTime', '2025-10-10T11:00:00.000Z');
            
            // MOCK: Trainer is available, but a booking already exists at this time.
            prismaMock.profile.findFirst.mockResolvedValue({ availability: { fri: ["09:00-17:00"] } } as any);
            prismaMock.booking.findMany.mockResolvedValue([{ startTime: new Date('2025-10-10T10:00:00.000Z'), endTime: new Date('2025-10-10T11:00:00.000Z') }]);

            const result = await createBooking(undefined, formData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('This time slot is already booked');
            expect(prismaMock.booking.create).not.toHaveBeenCalled();
          });

          it('should REJECT a booking that is outside of the trainer\'s available hours', async () => {
            const formData = new FormData(baseFormData.getOwnerDocument().createElement("form"));
            formData.append('startTime', '2025-10-10T18:00:00.000Z'); // 6 PM
            formData.append('endTime', '2025-10-10T19:00:00.000Z'); // 7 PM

            // MOCK: Trainer is only available 9-5 on Fridays. No overlapping bookings.
            prismaMock.profile.findFirst.mockResolvedValue({ availability: { fri: ["09:00-17:00"] } } as any);
            prismaMock.booking.findMany.mockResolvedValue([]);

            const result = await createBooking(undefined, formData);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain("is outside trainer's available hours");
            expect(prismaMock.booking.create).not.toHaveBeenCalled();
          });

          it('should ACCEPT a valid booking request', async () => {
            const formData = new FormData(baseFormData.getOwnerDocument().createElement("form"));
            formData.append('startTime', '2025-10-10T14:00:00.000Z'); // 2 PM
            formData.append('endTime', '2025-10-10T15:00:00.000Z'); // 3 PM

            // MOCK: Trainer is available and there are no overlapping bookings.
            prismaMock.profile.findFirst.mockResolvedValue({ availability: { fri: ["09:00-17:00"] } } as any);
            prismaMock.booking.findMany.mockResolvedValue([]);

            const result = await createBooking(undefined, formData);

            expect(result.success).toBe(true);
            expect(result.message).toContain('Session booked successfully!');
            expect(prismaMock.booking.create).toHaveBeenCalled();
          });
        });
        ```

-   `[ ]` **Task 2.2: Create Test for Advanced Search Logic**
    -   **Action:** Create a new test file to verify that the `getPublishedTrainers` function in the trainer API constructs the correct Prisma query based on input parameters.
    -   **File:** `src/lib/api/trainers.test.ts`
    -   **Content:**
        ```typescript
        // src/lib/api/trainers.test.ts
        import { getPublishedTrainers } from './trainers';
        import { prismaMock } from '../../../tests/singleton';

        describe('Trainer API Logic', () => {
          it('should build the correct where-clause for a combined query and location search', async () => {
            const query = 'yoga';
            const location = 'New York';
            
            await getPublishedTrainers(1, 10, query, location);

            // Verify that the Prisma client was called with a correctly structured 'where' argument
            expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
              where: {
                role: 'trainer',
                profile: { isNot: null },
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { username: { contains: query, mode: 'insensitive' } },
                  { profile: { certifications: { contains: query, mode: 'insensitive' } } },
                  { profile: { aboutMe: { contains: query, mode: 'insensitive' } } },
                  { profile: { methodology: { contains: query, mode: 'insensitive' } } },
                  { profile: { philosophy: { contains: query, mode: 'insensitive' } } },
                ],
                AND: [
                  { profile: { location: { contains: location, mode: 'insensitive' } } }
                ]
              }
            }));
          });
        });
        ```

-   `[ ]` **Task 2.3: Create Test for Dashboard Data Aggregation Service**
    -   **Action:** Create a new test file to verify the data aggregation logic in `getDashboardData`, ensuring it correctly counts and processes data from various models.
    -   **File:** `src/lib/dashboard.test.ts`
    -   **Content:**
        ```typescript
        // src/lib/dashboard.test.ts
        import { getDashboardData } from './dashboard';
        import { prismaMock } from '../../tests/singleton';

        describe('Dashboard Data Service', () => {
          it('should correctly aggregate client counts and session data', async () => {
            const trainerId = 'test-trainer-id';

            // MOCK: Provide mock return values for each Prisma call within getDashboardData
            prismaMock.client.count
              .mockResolvedValueOnce(5) // For activeClients
              .mockResolvedValueOnce(2); // For pendingClients
            prismaMock.clientSessionLog.count.mockResolvedValue(12); // For sessionsThisMonth
            prismaMock.profile.findUnique.mockResolvedValue({} as any); // Mock profile object
            prismaMock.clientSessionLog.findMany.mockResolvedValue([]); // For activity feed
            prismaMock.clientMeasurement.findMany.mockResolvedValue([]); // For activity feed
            prismaMock.clientProgressPhoto.findMany.mockResolvedValue([]); // For activity feed
            prismaMock.client.findMany.mockResolvedValue([]); // For spotlight client

            const data = await getDashboardData(trainerId);

            expect(data.activeClients).toBe(5);
            expect(data.pendingClients).toBe(2);
            expect(data.sessionsThisMonth).toBe(12);
            expect(prismaMock.client.count).toHaveBeenCalledWith({ where: { trainerId, status: 'active' } });
            expect(prismaMock.client.count).toHaveBeenCalledWith({ where: { trainerId, status: 'pending' } });
          });
        });
        ```
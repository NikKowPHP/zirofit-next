### work_breakdown/tasks/plan-phase-B-testing-setup.md
# **Phase B: Test Suite Implementation & Core Logic Coverage**

**Goal:** Establish a comprehensive testing environment and write unit and integration tests for the application's most critical business logic, focusing on server actions related to user profiles, clients, and bookings to ensure backend stability and prevent regressions.

---

### 1. Test Environment Enhancement

-   `[ ]` **Task 1.1: Install Testing Utility**

    -   **Action:** Install `jest-mock-extended`, a library that simplifies creating deep mocks for complex objects like the Prisma client.
    -   **Command:**
        ```bash
        npm install --save-dev jest-mock-extended
        ```

-   `[ ]` **Task 1.2: Create Singleton Prisma Mock**

    -   **File:** `tests/singleton.ts`
    -   **Action:** Create a reusable, singleton instance of a mocked Prisma client. This ensures that all tests across the suite use the same mock instance, which can be configured on a per-test basis.
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

-   `[ ]` **Task 1.3: Update Jest Setup**

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
        
        // Import the singleton mock setup
        require('./tests/singleton');

        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://mock-url.com';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-key-valid-format';
        ```

---

### 2. Core Logic Test Implementation

-   `[ ]` **Task 2.1: Create Test for Client Server Actions**

    -   **File:** `src/app/clients/actions/client-actions.test.ts`
    -   **Action:** Create a new test file to verify the behavior of client management functions.
    -   **Content:**
        ```typescript
        // src/app/clients/actions/client-actions.test.ts
        import { addClient } from './client-actions';
        import { prismaMock } from '../../../../tests/singleton';

        // Mock Next.js server functions
        jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
        jest.mock('next/navigation', () => ({ redirect: jest.fn() }));

        // Mock Supabase server client
        jest.mock('@/lib/supabase/server', () => ({
          createClient: jest.fn().mockResolvedValue({
            auth: {
              getUser: jest.fn().mockResolvedValue({
                data: { user: { id: 'test-user-id', email: 'trainer@test.com' } }
              })
            }
          })
        }));

        describe('Client Server Actions', () => {
          it('should successfully add a new client for an authenticated user', async () => {
            const formData = new FormData();
            formData.append('name', 'Test Client');
            formData.append('email', 'client@test.com');
            formData.append('phone', '1234567890');
            formData.append('status', 'active');

            // Mock user lookup
            prismaMock.user.findUnique.mockResolvedValue({ id: 'test-user-id', name: 'Test Trainer', email: 'trainer@test.com', username: 'test-trainer', role: 'trainer', emailVerifiedAt: new Date(), createdAt: new Date(), updatedAt: new Date() });
            
            // Mock client creation
            prismaMock.client.create.mockResolvedValue({ id: 'new-client-id', trainerId: 'test-user-id', name: 'Test Client', email: 'client@test.com', phone: '1234567890', status: 'active', dateOfBirth: null, goals: null, healthNotes: null, emergencyContactName: null, emergencyContactPhone: null, createdAt: new Date(), updatedAt: new Date() });

            // Call the action
            await addClient(null, formData);

            // Assertions
            expect(prismaMock.client.create).toHaveBeenCalledWith({
              data: {
                trainerId: 'test-user-id',
                name: 'Test Client',
                email: 'client@test.com',
                phone: '1234567890',
                status: 'active',
              }
            });
          });
        });
        ```

-   `[ ]` **Task 2.2: Create Test for Profile Server Actions**

    -   **File:** `src/app/profile/actions.test.ts`
    -   **Action:** Create a new test file to verify profile and booking-related actions.
    -   **Content:**
        ```typescript
        // src/app/profile/actions.test.ts
        import { updateCoreInfo } from './actions';
        import { prismaMock } from '../../../tests/singleton';

        jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

        jest.mock('@/lib/supabase/server', () => ({
          createClient: jest.fn().mockResolvedValue({
            auth: {
              getUser: jest.fn().mockResolvedValue({
                data: { user: { id: 'test-user-id' } }
              })
            }
          })
        }));

        describe('Profile Server Actions', () => {
            beforeEach(() => {
                // Mock the user and profile lookup for each test
                prismaMock.user.findUnique.mockResolvedValue({ id: 'test-user-id', name: 'Old Name', username: 'old-username', email: 'user@test.com', role: 'trainer', emailVerifiedAt: null, createdAt: new Date(), updatedAt: new Date() });
                prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-id', userId: 'test-user-id', availability: null, certifications: null, location: null, phone: null, aboutMe: null, philosophy: null, methodology: null, bannerImagePath: null, profilePhotoPath: null, createdAt: new Date(), updatedAt: new Date() });
            });

            it('should successfully update core info', async () => {
                const formData = new FormData();
                formData.append('name', 'New Name');
                formData.append('username', 'new-username');
                formData.append('certifications', 'CPT');
                formData.append('location', 'New Location');
                formData.append('phone', '1112223333');

                prismaMock.user.update.mockResolvedValue({ id: 'test-user-id', name: 'New Name', username: 'new-username', email: 'user@test.com', role: 'trainer', emailVerifiedAt: null, createdAt: new Date(), updatedAt: new Date() });
                prismaMock.profile.update.mockResolvedValue({ id: 'profile-id', userId: 'test-user-id', availability: null, certifications: 'CPT', location: 'New Location', phone: '1112223333', aboutMe: null, philosophy: null, methodology: null, bannerImagePath: null, profilePhotoPath: null, createdAt: new Date(), updatedAt: new Date() });

                const result = await updateCoreInfo(undefined, formData);

                expect(prismaMock.user.update).toHaveBeenCalledWith({
                    where: { id: 'test-user-id' },
                    data: { name: 'New Name', username: 'new-username' },
                });

                expect(prismaMock.profile.update).toHaveBeenCalledWith({
                    where: { userId: 'test-user-id' },
                    data: { certifications: 'CPT', location: 'New Location', phone: '1112223333' }
                });

                expect(result.success).toBe(true);
                expect(result.message).toBe('Core info updated successfully!');
            });
        });
        ```
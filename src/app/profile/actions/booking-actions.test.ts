// src/app/profile/actions/booking-actions.test.ts
import { createBooking } from './booking-actions';
import { prismaMock } from '../../../../tests/singleton';

// Mock Next.js and Resend dependencies
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('resend', () => ({ Resend: jest.fn().mockReturnValue({ emails: { send: jest.fn().mockResolvedValue({}) } }) }));

describe('Booking Server Actions', () => {
  beforeEach(() => {
    // Mock a successful trainer lookup for all tests in this suite
    prismaMock.user.findUnique.mockResolvedValue({ id: 'trainer-1', name: 'Test Trainer', email: 'trainer@test.com' } as any);
  });

  it('should REJECT a booking that overlaps with an existing appointment', async () => {
    const formData = new FormData();
    formData.append('trainerId', 'trainer-1');
    formData.append('clientName', 'Test Client');
    formData.append('clientEmail', 'test@example.com');
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
    const formData = new FormData();
    formData.append('trainerId', 'trainer-1');
    formData.append('clientName', 'Test Client');
    formData.append('clientEmail', 'test@example.com');
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
    const formData = new FormData();
    formData.append('trainerId', 'trainer-1');
    formData.append('clientName', 'Test Client');
    formData.append('clientEmail', 'test@example.com');
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
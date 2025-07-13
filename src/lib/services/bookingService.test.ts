// src/lib/services/bookingService.test.ts
import { isSlotAvailable } from './bookingService';

// No need to mock resend or next/cache here, this is a pure function test.

describe('Booking Service', () => {
  describe('isSlotAvailable', () => {
    it('should return FALSE when a booking overlaps with an existing appointment', () => {
      const requestedStart = new Date('2025-10-10T10:00:00.000Z');
      const requestedEnd = new Date('2025-10-10T11:00:00.000Z');
      
      const availability = { fri: ["09:00-17:00"] };
      const existingBookings = [{ startTime: new Date('2025-10-10T10:00:00.000Z'), endTime: new Date('2025-10-10T11:00:00.000Z') }];

      const result = isSlotAvailable(requestedStart, requestedEnd, availability, existingBookings);

      expect(result.available).toBe(false);
      expect(result.reason).toContain('This time slot is already booked');
    });

    it('should return FALSE when a booking is outside of the trainer\'s available hours', () => {
      const requestedStart = new Date('2025-10-10T18:00:00.000Z'); // 6 PM
      const requestedEnd = new Date('2025-10-10T19:00:00.000Z'); // 7 PM

      const availability = { fri: ["09:00-17:00"] };
      const existingBookings: any[] = [];

      const result = isSlotAvailable(requestedStart, requestedEnd, availability, existingBookings);
      
      expect(result.available).toBe(false);
      expect(result.reason).toContain("is outside trainer's available hours");
    });
    
    it('should return FALSE when trainer is not available on that day of the week', () => {
      const requestedStart = new Date('2025-10-11T10:00:00.000Z'); // This is a Saturday
      const requestedEnd = new Date('2025-10-11T11:00:00.000Z');

      const availability = { fri: ["09:00-17:00"] }; // Available on Friday, not Saturday
      const existingBookings: any[] = [];

      const result = isSlotAvailable(requestedStart, requestedEnd, availability, existingBookings);
      
      expect(result.available).toBe(false);
      expect(result.reason).toContain("not available on this day");
    });

    it('should return TRUE for a valid booking request', () => {
      const requestedStart = new Date('2025-10-10T14:00:00.000Z'); // 2 PM
      const requestedEnd = new Date('2025-10-10T15:00:00.000Z'); // 3 PM

      const availability = { fri: ["09:00-17:00"] };
      const existingBookings: any[] = [];

      const result = isSlotAvailable(requestedStart, requestedEnd, availability, existingBookings);

      expect(result.available).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });
});
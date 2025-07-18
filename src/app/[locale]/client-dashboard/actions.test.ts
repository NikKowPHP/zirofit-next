
import { shareDataWithTrainer, unlinkFromTrainer } from './actions';
import { prismaMock } from '@tests/singleton';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');
jest.mock("next/cache");

const mockSupabase = {
    auth: {
        getUser: jest.fn(),
    },
};
(createClient as jest.Mock).mockResolvedValue(mockSupabase);

describe('Client Dashboard Actions', () => {
    const clientUser = { 
        id: 'client-user-id', 
        email: 'client@example.com',
        user_metadata: { full_name: 'Test Client' }
    };
    const trainerUser = { id: 'trainer-user-id', name: 'Test Trainer' };
    const selfManagedClientRecord = { id: 'client-record-1', userId: clientUser.id, trainerId: null, email: clientUser.email, name: 'Test Client' };

    beforeEach(() => {
        jest.clearAllMocks();
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: clientUser } });
    });

    describe('shareDataWithTrainer', () => {
        it('should perform a fresh link when no trainer record exists', async () => {
            prismaMock.user.findUnique.mockResolvedValue(trainerUser as any);
            prismaMock.client.findUnique.mockResolvedValue(selfManagedClientRecord as any);
            prismaMock.client.findFirst.mockResolvedValue(null); // No pre-existing record from trainer

            // Mock transaction
            prismaMock.$transaction.mockImplementation(async (callback) => {
                const tx = prismaMock; // Use the mock itself as the transaction client
                return await callback(tx);
            });

            await shareDataWithTrainer('test-trainer');

            expect(prismaMock.client.update).toHaveBeenCalledWith({
                where: { id: selfManagedClientRecord.id },
                data: { trainerId: trainerUser.id }
            });
            expect(prismaMock.notification.create).toHaveBeenCalled();
            expect(prismaMock.client.delete).not.toHaveBeenCalled();
        });

        it('should merge data when a trainer record already exists', async () => {
            const trainerCreatedClientRecord = { id: 'client-record-2', userId: null, trainerId: trainerUser.id, email: clientUser.email };
            
            prismaMock.user.findUnique.mockResolvedValue(trainerUser as any);
            prismaMock.client.findUnique.mockResolvedValue(selfManagedClientRecord as any);
            prismaMock.client.findFirst.mockResolvedValue(trainerCreatedClientRecord as any);

            prismaMock.$transaction.mockImplementation(async (callback) => {
                const tx = prismaMock;
                return await callback(tx);
            });

            await shareDataWithTrainer('test-trainer');
            
            // Verify data is moved
            expect(prismaMock.clientExerciseLog.updateMany).toHaveBeenCalledWith({ where: { clientId: selfManagedClientRecord.id }, data: { clientId: trainerCreatedClientRecord.id } });
            
            // Verify trainer's record is updated
            expect(prismaMock.client.update).toHaveBeenCalledWith({ where: { id: trainerCreatedClientRecord.id }, data: { userId: clientUser.id } });

            // Verify self-managed record is deleted
            expect(prismaMock.client.delete).toHaveBeenCalledWith({ where: { id: selfManagedClientRecord.id } });

            expect(prismaMock.notification.create).toHaveBeenCalled();
        });
    });

    describe('unlinkFromTrainer', () => {
        it('should set trainerId to null on the client record', async () => {
            const linkedClientRecord = { ...selfManagedClientRecord, trainerId: trainerUser.id };
            prismaMock.client.findUnique.mockResolvedValue(linkedClientRecord as any);
            
            await unlinkFromTrainer();

            expect(prismaMock.client.update).toHaveBeenCalledWith({
                where: { id: linkedClientRecord.id },
                data: { trainerId: null }
            });

            expect(prismaMock.notification.create).toHaveBeenCalledWith({
                data: {
                    userId: trainerUser.id,
                    message: expect.any(String),
                    type: "client_unlink"
                }
            });
        });
    });
});
import { prisma } from '@/lib/prisma';

// Helper to authorize if client belongs to trainer
export async function authorizeClientAccess(clientId: string, authUserId: string): Promise<boolean> {
    const client = await prisma.client.findFirst({
        where: { id: clientId, trainerId: authUserId }
    });
    return !!client;
}
"use server";

import { createClient } from '../../lib/supabase/server';
import { prisma } from '../../lib/prisma';

export async function getTrainerClients() {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    // This should be caught by middleware, but it's good practice.
    throw new Error("User not authenticated.");
  }

  try {
    const clients = await prisma.client.findMany({
      where: {
        trainerId: authUser.id, // Fetch clients for the logged-in trainer
      },
      orderBy: {
        name: 'asc',
      },
    });
    return clients;
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return []; // Return empty array on error
  }
}
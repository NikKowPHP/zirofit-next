// src/lib/api/trainers.ts
import { prisma } from '@/lib/prisma';

export async function getPublishedTrainers(page = 1, pageSize = 15) {
  const skip = (page - 1) * pageSize;
  try {
    const trainers = await prisma.user.findMany({
      where: {
        role: 'trainer',
        profile: {
          // Add conditions for a "published" profile if that becomes a feature
          // For now, any user with a profile is considered.
          isNot: null,
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        profile: {
          select: {
            location: true,
            profilePhotoPath: true, // For display on the list
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      skip: skip,
      take: pageSize,
    });

    const totalTrainers = await prisma.user.count({
      where: {
        role: 'trainer',
        profile: {
          isNot: null,
        },
      },
    });
    
    return {
      trainers,
      totalTrainers,
      currentPage: page,
      totalPages: Math.ceil(totalTrainers / pageSize),
    };
  } catch (error) {
    console.error("Failed to fetch published trainers:", error);
    // In a real app, you might throw a custom error or return a specific error structure
    return { trainers: [], totalTrainers: 0, currentPage: 1, totalPages: 0, error: "Failed to load trainers." };
  }
}

export async function getTrainerProfileByUsername(username: string) {
  try {
    const userWithProfile = await prisma.user.findUnique({
      where: { username },
      include: {
        profile: {
          include: {
            services: { orderBy: { createdAt: 'asc' } },
            testimonials: { orderBy: { createdAt: 'desc' } },
            transformationPhotos: { orderBy: { createdAt: 'desc' } },
            externalLinks: { orderBy: { createdAt: 'asc' } },
            benefits: { orderBy: { orderColumn: 'asc' } },
          },
        },
      },
    });

    if (!userWithProfile || !userWithProfile.profile) {
      return null; // Or throw a NotFound error
    }
    return userWithProfile; // Contains user and their full profile
  } catch (error) {
    console.error(`Failed to fetch profile for username ${username}:`, error);
    return null; // Or throw
  }
}
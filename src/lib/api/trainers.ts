// src/lib/api/trainers.ts
import { prisma } from "@/lib/prisma";
import { transformImagePath } from "../utils";

export async function getPublishedTrainers(page = 1, pageSize = 15) {
  const skip = (page - 1) * pageSize;
  try {
    const trainers = await prisma.user.findMany({
      where: {
        role: "trainer",
        profile: {
          isNot: null,
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        profile: {
          select: {
            profilePhotoPath: true,
            location: true,
            certifications: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      skip,
      take: pageSize,
    });

    // Transform the image paths to full URLs
    const trainersWithUrls = trainers.map((trainer) => {
      if (trainer.profile) {
        trainer.profile.profilePhotoPath = transformImagePath(
          trainer.profile.profilePhotoPath,
        );
      }
      return trainer;
    });

    const totalTrainers = await prisma.user.count({
      where: {
        role: "trainer",
        profile: {
          isNot: null,
        },
      },
    });
    return {
      trainers: trainersWithUrls,
      totalTrainers,
      currentPage: page,
      totalPages: Math.ceil(totalTrainers / pageSize),
    };
  } catch (error) {
    console.error("Failed to fetch published trainers:", error);
    // In a real app, you might throw a custom error or return a specific error structure
    return {
      trainers: [],
      totalTrainers: 0,
      currentPage: 1,
      totalPages: 0,
      error: "Failed to load trainers.",
    };
  }
}

export async function getTrainerProfileByUsername(username: string) {
  try {
    const userWithProfile = await prisma.user.findUnique({
      where: { username },
      include: {
        profile: {
          include: {
            services: { orderBy: { createdAt: "asc" } },
            testimonials: { orderBy: { createdAt: "desc" } },
            transformationPhotos: { orderBy: { createdAt: "desc" } },
            externalLinks: { orderBy: { createdAt: "asc" } },
            benefits: { orderBy: { orderColumn: "asc" } },
          },
        },
      },
    });

    if (!userWithProfile || !userWithProfile.profile) {
      return null; // Or throw a NotFound error
    }

    // Transform all image paths in the profile
    const profile = userWithProfile.profile;
    profile.bannerImagePath = transformImagePath(profile.bannerImagePath);
    profile.profilePhotoPath = transformImagePath(profile.profilePhotoPath);
    profile.transformationPhotos.forEach((photo) => {
      // Note: Here we transform the path directly on the object.
      // The component will just use `photo.imagePath`.
      (photo as any).imagePath = transformImagePath(photo.imagePath);
    });

    return userWithProfile; // Contains user and their full profile
  } catch (error) {
    console.error(`Failed to fetch profile for username ${username}:`, error);
    return null; // Or throw
  }
}

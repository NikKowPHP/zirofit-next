// src/lib/api/trainers.ts
import { prisma } from "@/lib/prisma";
import { transformImagePath, normalizeLocation } from "../utils";
import type { Prisma } from '@prisma/client';

export async function getPublishedTrainers(page = 1, pageSize = 15, query?: string, location?: string, sortBy?: string) {
  const skip = (page - 1) * pageSize;

  const whereClause: Prisma.UserWhereInput = {
    role: "trainer",
    profile: {
      isNot: null,
    },
  };

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { username: { contains: query, mode: 'insensitive' } },
      { profile: { certifications: { contains: query, mode: 'insensitive' } } },
      { profile: { aboutMe: { contains: query, mode: 'insensitive' } } },
      { profile: { methodology: { contains: query, mode: 'insensitive' } } },
      { profile: { philosophy: { contains: query, mode: 'insensitive' } } },
    ];
  }

  if (location) {
    const locationFilter: Prisma.UserWhereInput = {
      profile: {
        locationNormalized: { contains: normalizeLocation(location) },
      },
    };
    if (whereClause.AND) {
      if (Array.isArray(whereClause.AND)) {
        whereClause.AND.push(locationFilter);
      } else {
        whereClause.AND = [whereClause.AND, locationFilter];
      }
    } else {
      whereClause.AND = [locationFilter];
    }
  }

  let orderBy: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[] = { name: "asc" }; // Default sort
  if (sortBy === 'name_desc') {
    orderBy = { name: 'desc' };
  } else if (sortBy === 'newest') {
    orderBy = { createdAt: 'desc' };
  } else if (sortBy === 'price_asc') {
    orderBy = { profile: { minServicePrice: 'asc' } };
  } else if (sortBy === 'price_desc') {
    orderBy = { profile: { minServicePrice: 'desc' } };
  }

  try {
    const trainers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        username: true,
        profile: {
          select: {
            profilePhotoPath: true,
            location: true,
            certifications: true,
            latitude: true,
            longitude: true,
            services: {
              where: { price: { not: null } },
              orderBy: { price: 'asc' },
              take: 1,
              select: {
                price: true,
                currency: true,
                duration: true,
              },
            },
          },
        },
      },
      orderBy,
      skip,
      take: pageSize,
    });

    // Transform image paths and serialize Decimal prices
    const trainersWithUrls = trainers.map((trainer) => {
      if (trainer.profile) {
        return {
          ...trainer,
          profile: {
            ...trainer.profile,
            profilePhotoPath: transformImagePath(trainer.profile.profilePhotoPath),
            services: trainer.profile.services.map(s => ({
              ...s,
              price: s.price?.toString() ?? null,
            })),
          },
        };
      }
      return trainer;
    });

    const totalTrainers = await prisma.user.count({ where: whereClause });
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

export interface Trainer {
  id: string;
  name: string;
  username: string | null;
  profile: {
    profilePhotoPath: string | null;
    location: string | null;
    certifications: string | null;
    latitude: number | null;
    longitude: number | null;
    services: {
        price: string | null;
        currency: string | null;
        duration: number | null;
    }[];
  } | null;
}

export async function getTrainerProfileByUsername(username: string) {
  try {
    const userWithProfileFromDb = await prisma.user.findUnique({
      where: { username },
      include: {
        profile: {
          include: {
            services: { orderBy: { createdAt: "asc" } },
            testimonials: { orderBy: { createdAt: "desc" } },
            transformationPhotos: { orderBy: { createdAt: "desc" } },
            externalLinks: { orderBy: { createdAt: "asc" } },
            benefits: { orderBy: { orderColumn: "asc" } },
            socialLinks: { orderBy: { createdAt: "asc" } },
          },
        },
      },
    });

    if (!userWithProfileFromDb || !userWithProfileFromDb.profile) {
      return null;
    }

    // Create a new, fully serialized object to return to the client component.
    const serializedProfile = {
      ...userWithProfileFromDb.profile,
      bannerImagePath: transformImagePath(userWithProfileFromDb.profile.bannerImagePath),
      profilePhotoPath: transformImagePath(userWithProfileFromDb.profile.profilePhotoPath),
      transformationPhotos: userWithProfileFromDb.profile.transformationPhotos.map(photo => ({
        ...photo,
        imagePath: transformImagePath(photo.imagePath),
      })),
      services: userWithProfileFromDb.profile.services.map(service => ({
        ...service,
        price: service.price ? service.price.toString() : null,
      })),
      minServicePrice: userWithProfileFromDb.profile.minServicePrice
        ? userWithProfileFromDb.profile.minServicePrice.toString()
        : null,
    };
    
    const userWithProfile = {
        ...userWithProfileFromDb,
        profile: serializedProfile
    }

    return userWithProfile; // Contains user and their full, serialized profile
  } catch (error) {
    console.error(`Failed to fetch profile for username ${username}:`, error);
    return null; // Or throw
  }
}
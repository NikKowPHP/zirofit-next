import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { transformImagePath } from "@/lib/utils";

// Export types for client components to consume, avoiding direct imports that can fail in some build contexts.
export type User = Prisma.UserGetPayload<{}>;
export type Profile = Prisma.ProfileGetPayload<{}>;
export type Service = Prisma.ServiceGetPayload<{}>;
export type Testimonial = Prisma.TestimonialGetPayload<{}>;
export type TransformationPhoto = Prisma.TransformationPhotoGetPayload<{}>;
export type ExternalLink = Prisma.ExternalLinkGetPayload<{}>;
export type Benefit = Prisma.BenefitGetPayload<{}>;
export type SocialLink = Prisma.SocialLinkGetPayload<{}>;

export type TransformationPhotoWithPublicUrl = TransformationPhoto & {
  publicUrl: string;
};

// Helper function to get user and profile, creating profile if it doesn't exist.
export async function getUserAndProfile() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    throw new Error("User not authenticated.");
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user) {
    throw new Error("User not found in database.");
  }

  let profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: { userId: user.id },
    });
  }

  return { user, profile, authUser }; // Return authUser as well
}

// Action for fetching all profile data, used on the edit page.
export async function getCurrentUserProfileData() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return null;

    let userWithProfile = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        profile: {
          include: {
            services: { orderBy: { createdAt: "asc" } },
            testimonials: { orderBy: { createdAt: "desc" } },
            transformationPhotos: { orderBy: { createdAt: "desc" } },
            externalLinks: { orderBy: { createdAt: "asc" } },
            benefits: { orderBy: { orderColumn: "asc" } },
            socialLinks: { orderBy: { createdAt: "asc" } }, // Added socialLinks
          },
        },
      },
    });

    if (userWithProfile && !userWithProfile.profile) {
      await prisma.profile.create({ data: { userId: userWithProfile.id } });
      // Re-fetch to get the new profile and its relations (which will be empty)
      userWithProfile = await prisma.user.findUnique({
        where: { id: authUser.id },
        include: {
          profile: {
            include: {
              services: { orderBy: { createdAt: "asc" } },
              testimonials: { orderBy: { createdAt: "desc" } },
              transformationPhotos: { orderBy: { createdAt: "desc" } },
              externalLinks: { orderBy: { createdAt: "asc" } },
              benefits: { orderBy: { orderColumn: "asc" } },
              socialLinks: { orderBy: { createdAt: "asc" } }, // Added socialLinks
            },
          },
        },
      });
    }

    if (!userWithProfile) return null;

    if (userWithProfile.profile) {
      userWithProfile.profile.bannerImagePath = transformImagePath(
        userWithProfile.profile.bannerImagePath,
      );
      userWithProfile.profile.profilePhotoPath = transformImagePath(
        userWithProfile.profile.profilePhotoPath,
      );
      userWithProfile.profile.transformationPhotos.forEach((photo) => {
        (photo as any).imagePath = transformImagePath(photo.imagePath);
      });
    }

    return userWithProfile;
  } catch (error) {
    console.error("Error fetching user profile data:", error);
    return null;
  }
}
import { prisma } from "@/lib/prisma";

export const getFullUserProfile = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
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
};
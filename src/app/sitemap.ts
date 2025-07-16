
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { locales } from "@/i18n";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const generateAlternates = (path: string) => {
    return locales.reduce(
      (acc, locale) => {
        acc[locale] = `${baseUrl}/${locale}${path === "/" ? "" : path}`;
        return acc;
      },
      {} as Record<string, string>,
    );
  };

  // 1. Get all trainers with a public profile
  const trainers = await prisma.user.findMany({
    where: {
      role: "trainer",
      username: {
        not: null,
      },
    },
    select: {
      username: true,
      updatedAt: true,
    },
  });

  const trainerUrls: MetadataRoute.Sitemap = trainers.map((trainer) => ({
    url: `${baseUrl}/en/trainer/${trainer.username}`, // Canonical URL
    lastModified: trainer.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    alternates: {
      languages: generateAlternates(`/trainer/${trainer.username}`),
    },
  }));

  // 2. Define static routes
  const staticPaths = [
    { path: "/", priority: 1.0, changeFrequency: "monthly" as const },
    { path: "/trainers", priority: 0.9, changeFrequency: "weekly" as const },
    {
      path: "/auth/login",
      priority: 0.1,
      changeFrequency: "yearly" as const,
    },
    {
      path: "/auth/register",
      priority: 0.5,
      changeFrequency: "yearly" as const,
    },
  ];

  const staticUrls: MetadataRoute.Sitemap = staticPaths.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${baseUrl}/en${path === "/" ? "" : path}`, // Canonical URL using 'en'
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: generateAlternates(path),
      },
    }),
  );

  // 3. Combine and return
  return [...staticUrls, ...trainerUrls];
}
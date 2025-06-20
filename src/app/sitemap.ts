// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // 1. Get all trainers with a public profile
  const trainers = await prisma.user.findMany({
    where: {
      role: 'trainer',
      username: {
        not: null,
      },
    },
    select: {
      username: true,
      updatedAt: true,
    },
  });

  const trainerUrls = trainers.map((trainer) => ({
    url: `${baseUrl}/trainer/${trainer.username}`,
    lastModified: trainer.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 2. Define static routes
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/trainers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // 3. Combine and return
  return [...staticUrls, ...trainerUrls];
}
// src/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/*/dashboard/", "/*/profile/", "/*/clients/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
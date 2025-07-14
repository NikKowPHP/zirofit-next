// prisma/seed-backfill-locations.ts
import { PrismaClient } from "@prisma/client";
import { normalizeLocation } from "../src/lib/utils";
import { geocodeLocation } from "../src/lib/services/geocodingService";

const prisma = new PrismaClient();

async function backfillLocations() {
  console.log("Starting backfill for locations...");

  const profilesToUpdate = await prisma.profile.findMany({
    where: {
      location: {
        not: null,
      },
      // Optional: only update profiles that haven't been processed yet
      // locationNormalized: null,
    },
  });

  console.log(`Found ${profilesToUpdate.length} profiles to update.`);

  for (const profile of profilesToUpdate) {
    if (!profile.location) continue;

    try {
      console.log(
        `Processing profile ${profile.id} for location: "${profile.location}"`,
      );

      const locationNormalized = normalizeLocation(profile.location);
      const coords = await geocodeLocation(profile.location);

      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          locationNormalized,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        },
      });

      console.log(`  -> Successfully updated profile ${profile.id}.`);

      // To respect API rate limits, add a small delay.
      // Nominatim's policy is max 1 request/sec.
      await new Promise((resolve) => setTimeout(resolve, 1100));
    } catch (error) {
      console.error(`  -> Failed to update profile ${profile.id}:`, error);
    }
  }

  console.log("Location backfill completed.");
}

backfillLocations()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
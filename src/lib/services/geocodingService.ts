// src/lib/services/geocodingService.ts

// Using OpenStreetMap's Nominatim API. It's free but has usage policies.
// For a production app, a paid service like Google Geocoding API or Mapbox would be better.
// A custom user-agent is required by Nominatim's policy.
const NOMINATIM_API_URL = "https://nominatim.openstreetmap.org/search";

interface GeocodeResult {
  lat: string;
  lon: string;
}

export async function geocodeLocation(
  location: string,
): Promise<{ latitude: number; longitude: number } | null> {
  if (!location) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

  try {
    const params = new URLSearchParams({
      q: location,
      format: "json",
      limit: "1",
    });

    const response = await fetch(`${NOMINATIM_API_URL}?${params.toString()}`, {
      headers: {
        "User-Agent": "ZIRO.FIT Geocoding Service/1.0 (contact@ziro.fit)",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Geocoding API failed with status: ${response.status}`);
      return null;
    }

    const data: GeocodeResult[] = await response.json();

    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.error("Error during geocoding: Request timed out.");
    } else {
      console.error("Error during geocoding:", error);
    }
    return null;
  }
}
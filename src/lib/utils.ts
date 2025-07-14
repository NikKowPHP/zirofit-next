import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Transforms a relative Supabase storage path into a full public URL.
 * @param path The relative path from the database.
 * @returns A full URL or an empty string if the path is invalid.
 */
export function transformImagePath(path: string | null | undefined): string {
  if (!path) {
    return ""; // Return empty string for null, undefined, or empty paths.
  }
  // If it's already a full URL or a local public path, return it as is.
  return path.startsWith("http") || path.startsWith("/")
    ? path
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/zirofit/${path}`;
}

/**
 * Normalizes a location string for searching by converting to lowercase and removing diacritics.
 * @param location The location string to normalize.
 * @returns The normalized location string.
 */
export function normalizeLocation(location: string): string {
  if (!location) return "";

  return location
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters into base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // Remove the diacritical marks
    .replace(/ł/g, "l"); // Special case for Polish 'ł' which doesn't decompose correctly
}